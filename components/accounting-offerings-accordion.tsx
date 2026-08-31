"use client"

import { useId, useState } from "react"
import type { KeyboardEvent } from "react"
import { ArrowRight, Headset, HeartHandshake, Percent, Users, type LucideIcon } from "lucide-react"

export type AccountingOfferingIcon = "percent" | "headset" | "users" | "handshake"

export type AccountingOfferingItem = {
	title: string
	description: string
	href: string
	icon: AccountingOfferingIcon
}

const offeringIcons: Record<AccountingOfferingIcon, LucideIcon> = {
	percent: Percent,
	headset: Headset,
	users: Users,
	handshake: HeartHandshake,
}

type AccountingOfferingsAccordionProps = {
	items: AccountingOfferingItem[]
}

export function AccountingOfferingsAccordion({ items }: AccountingOfferingsAccordionProps) {
	const generatedId = useId()
	const accordionId = generatedId.replace(/:/g, "")
	const [openIndex, setOpenIndex] = useState<number | null>(null)

	function handleTriggerKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
		if (event.key !== "Enter" && event.key !== " ") {
			return
		}

		event.preventDefault()
		setOpenIndex((currentIndex) => (currentIndex === index ? null : index))
	}

	return (
		<div className="accounting-offerings-accordion" data-testid="accounting-offerings-accordion">
			{items.map(({ title, description, href, icon }, index) => {
				const Icon = offeringIcons[icon]
				const isOpen = openIndex === index
				const triggerId = `accounting-offering-trigger-${accordionId}-${index}`
				const panelId = `accounting-offering-panel-${accordionId}-${index}`

				return (
					<article className={`accounting-offering-item${isOpen ? " is-open" : ""}`} key={title}>
						<button
							id={triggerId}
							className="accounting-offering-trigger"
							type="button"
							aria-expanded={isOpen}
							aria-controls={panelId}
							onClick={() => setOpenIndex((currentIndex) => (currentIndex === index ? null : index))}
							onKeyDown={(event) => handleTriggerKeyDown(index, event)}
						>
							<span className="accounting-offering-heading">
								<span className="accounting-offering-icon" aria-hidden="true">
									<Icon size={22} strokeWidth={2.2} />
								</span>
								<span className="accounting-offering-title">{title}</span>
							</span>
							<span className="accounting-offering-toggle" aria-hidden="true" />
						</button>

						<div
							id={panelId}
							className="accounting-offering-panel"
							role="region"
							aria-labelledby={triggerId}
							aria-hidden={!isOpen}
						>
							<div className="accounting-offering-panel-inner">
								<div className="accounting-offering-copy">
									<p>{description}</p>
									<a
										className="accounting-offering-cta"
										href={href}
										target="_blank"
										rel="noreferrer"
										tabIndex={isOpen ? 0 : -1}
									>
										Saber Mais
										<ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
									</a>
								</div>
							</div>
						</div>
					</article>
				)
			})}
		</div>
	)
}
