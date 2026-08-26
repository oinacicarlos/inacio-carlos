import type { SupabaseClient } from "@supabase/supabase-js"
import { maskWhatsAppPhone, normalizeBrazilianWhatsAppPhone } from "@/lib/whatsapp/contacts"

const CUSTOMER_SERVICE_WINDOW_HOURS = 24
export const OPTOUT_TEXT_PATTERN = /\b(parar|pare|cancelar|cancele|sair|remover|descadastrar|stop|unsubscribe)\b/i
export const INTEREST_TEXT_PATTERN = /\b(quero\s+a\s+an[aá]lise|sim,\s*quero|tenho interesse|quero atendimento|quero saber|quero)\b/i

export type WhatsAppInboxMessageInput = {
  phone: string
  name?: string | null
  wamid?: string | null
  direction: "inbound" | "outbound"
  type: "text" | "button" | "template" | "system" | "unsupported"
  text?: string | null
  buttonText?: string | null
  templateName?: string | null
  status?: string | null
  metaTimestamp?: string | null
  incrementUnread?: boolean
}

function addCustomerServiceWindow(value: string | null | undefined) {
  const base = value ? new Date(value) : new Date()
  if (Number.isNaN(base.getTime())) return new Date(Date.now() + CUSTOMER_SERVICE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()
  return new Date(base.getTime() + CUSTOMER_SERVICE_WINDOW_HOURS * 60 * 60 * 1000).toISOString()
}

export function getMessageDisplayText(input: Pick<WhatsAppInboxMessageInput, "text" | "buttonText" | "templateName" | "type">) {
  if (input.text?.trim()) return input.text.trim()
  if (input.buttonText?.trim()) return input.buttonText.trim()
  if (input.templateName?.trim()) return `Template: ${input.templateName.trim()}`
  return input.type === "unsupported" ? "Mensagem não suportada" : "Mensagem"
}

export async function upsertWhatsAppInboxMessage(supabase: SupabaseClient, input: WhatsAppInboxMessageInput) {
  const phone = normalizeBrazilianWhatsAppPhone(input.phone)
  if (!phone) return null

  const displayText = getMessageDisplayText(input)
  const metaTimestamp = input.metaTimestamp ?? new Date().toISOString()
  const existingMessage = input.wamid
    ? await supabase.from("whatsapp_messages").select("id").eq("wamid", input.wamid).maybeSingle()
    : { data: null }
  const isNewMessage = !existingMessage.data
  const interested = input.direction === "inbound" && INTEREST_TEXT_PATTERN.test(displayText)
  const optedOut = input.direction === "inbound" && OPTOUT_TEXT_PATTERN.test(displayText)

  const { data: existingConversation } = await supabase
    .from("whatsapp_conversations")
    .select("id,unread_count,interested,opted_out")
    .eq("phone", phone)
    .maybeSingle()

  const conversationPayload = {
    phone,
    name: input.name?.trim() || null,
    last_message_text: displayText,
    last_message_at: metaTimestamp,
    unread_count: input.incrementUnread && isNewMessage ? Number(existingConversation?.unread_count ?? 0) + 1 : Number(existingConversation?.unread_count ?? 0),
    interested: Boolean(existingConversation?.interested) || interested,
    opted_out: Boolean(existingConversation?.opted_out) || optedOut,
    customer_service_window_expires_at: input.direction === "inbound" ? addCustomerServiceWindow(metaTimestamp) : undefined,
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("whatsapp_conversations")
    .upsert(conversationPayload, { onConflict: "phone" })
    .select("id")
    .single()

  if (conversationError || !conversation) {
    console.warn("[whatsapp:inbox] conversation.upsert_failed", {
      phone: maskWhatsAppPhone(phone),
      message: conversationError?.message ?? "unknown",
    })
    return null
  }

  if (!input.wamid && !isNewMessage) return conversation

  const { error: messageError } = await supabase
    .from("whatsapp_messages")
    .upsert({
      conversation_id: conversation.id,
      wamid: input.wamid,
      direction: input.direction,
      type: input.type,
      text: input.text?.trim() || null,
      button_text: input.buttonText?.trim() || null,
      template_name: input.templateName?.trim() || null,
      status: input.status ?? null,
      meta_timestamp: metaTimestamp,
    }, input.wamid ? { onConflict: "wamid" } : undefined)

  if (messageError) {
    console.warn("[whatsapp:inbox] message.upsert_failed", {
      phone: maskWhatsAppPhone(phone),
      wamid: input.wamid ?? null,
      message: messageError.message,
    })
  }

  return conversation
}

export async function updateWhatsAppInboxMessageStatus(
  supabase: SupabaseClient,
  wamid: string,
  status: string,
  options: { errorCode?: string | null; errorMessage?: string | null } = {},
) {
  const { data: message } = await supabase
    .from("whatsapp_messages")
    .select("id,conversation_id")
    .eq("wamid", wamid)
    .maybeSingle()

  if (!message) return

  await supabase
    .from("whatsapp_messages")
    .update({
      status,
      error_code: options.errorCode ?? null,
      error_message: options.errorMessage ?? null,
    })
    .eq("id", message.id)
}
