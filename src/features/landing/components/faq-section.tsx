"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import * as motion from "motion/react-client";

const faqs = [
  {
    question: "What makes your KPI tracking solution different?",
    answer:
      "Our platform combines intuitive design with powerful analytics, making it easy to track, visualize, and act on your KPIs. With real-time updates and customizable dashboards, you'll always have the insights you need at your fingertips.",
  },
  {
    question: "How easy is it to get started?",
    answer:
      "Getting started is simple - sign up for an account, connect your data sources, and start tracking your KPIs in minutes. Our platform guides you through the setup process, and our support team is always available to help.",
  },
  {
    question: "Can I customize my KPI dashboards?",
    answer:
      "Yes! Our platform offers fully customizable dashboards. You can choose from various visualization types, arrange widgets as needed, and create different views for different teams or purposes.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We provide comprehensive support through multiple channels. For immediate assistance, visit our documentation or email our support team at support@kpitracker.com. Enterprise customers receive dedicated account management and priority support.",
  },
  {
    question: "Do you offer custom integrations?",
    answer:
      "Yes, we support a wide range of integrations. For custom integration needs, please email our enterprise team at enterprise@kpitracker.com to discuss your specific requirements.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! You can try our platform free for 14 days with no credit card required. If you need more time to evaluate, reach out to our sales team at sales@kpitracker.com.",
  },
];

export function FaqSection() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-24 md:py-32" id="faq">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="bg-primary/10 text-primary mx-auto mb-6 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium">
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            FAQ
          </div>
          <h2 className="from-foreground via-foreground/90 to-foreground/70 bg-gradient-to-br bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground/80 mx-auto mt-6 max-w-3xl text-lg md:text-xl">
            Got questions? We've got answers. Can't find what you're looking
            for?{" "}
            <Link
              href="mailto:support@impact-tracker.com"
              className="text-primary hover:text-primary/80 decoration-primary/30 font-medium underline underline-offset-4 transition-colors"
            >
              Reach out to our support team
            </Link>
            .
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-12 max-w-md"
        >
          <div className="relative">
            <svg
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto grid max-w-4xl gap-6"
        >
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-border/40 bg-card/50 hover:border-border/60 hover:bg-card/70 border backdrop-blur-sm transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg leading-relaxed font-semibold">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground/90 text-base leading-relaxed">
                    {faq.answer}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground py-12 text-center"
          >
            <div className="bg-muted/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.002-5.824-2.662"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">No FAQs found</p>
            <p className="mt-2">Try adjusting your search terms</p>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
