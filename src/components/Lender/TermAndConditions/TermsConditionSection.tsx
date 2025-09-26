"use client"

import React, { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

type Section = {
  id: number
  heading: string
  content: string
}

function TermsConditionSection() {
  const [title, setTitle] = useState<string>("Terms & Conditions")
  const [date, setDate] = useState<string>("")
  const [sections, setSections] = useState<Section[]>([
    { id: 1, heading: "Introduction", content: "" },
  ])
  const [openSection, setOpenSection] = useState<string>("section-1")
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [titleReminder, setTitleReminder] = useState<boolean>(false)

  // Handle heading/content updates
  const handleSectionChange = (
    id: number,
    field: "heading" | "content",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    )
  }

  // Add a new blank section and auto-open it
  const addSection = () => {
    const newId = (sections[sections.length - 1]?.id ?? 0) + 1
    const newSectionValue = `section-${newId}`

    setSections((prev) => [
      ...prev,
      { id: newId, heading: "New Section", content: "" },
    ])

    // trigger reminder if title is empty
    if (!title.trim()) setTitleReminder(true)

    setOpenSection(newSectionValue)
  }

  // Remove section
  const removeSection = (id: number) => {
    setSections((prev) => prev.filter((section) => section.id !== id))
    if (openSection === `section-${id}`) {
      setOpenSection("")
    }
  }

  // Simulate save action
  const handleSave = () => {
    if (!title.trim()) {
      setTitleReminder(true)
      return
    }
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-300 to-rose-600 bg-clip-text text-transparent">
            Terms & Conditions Builder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, edit, and preview your Terms & Conditions page with a
            professional layout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form Section */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-muted/40 rounded-t-lg">
              <CardTitle className="text-rose-700">Editor</CardTitle>
              <CardDescription>
                Fill in the details to generate your Terms & Conditions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (e.target.value.trim()) setTitleReminder(false)
                  }}
                  placeholder="Enter page title"
                  className={titleReminder ? "border-red-500" : ""}
                />
                {titleReminder && (
                  <p className="text-red-500 text-sm mt-1">
                    Please don’t forget to add a title.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="font-medium">
                  Last Updated
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Accordion for Sections */}
              <CardContent className="space-y-5 pt-6 max-h-[33vh] overflow-y-auto pr-2">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={openSection}
                  onValueChange={(val) => {
                    if (!title.trim()) setTitleReminder(true)
                    setOpenSection(val || "")
                  }}
                >
                  {sections.map((section) => (
                    <AccordionItem key={section.id} value={`section-${section.id}`}>
                      <AccordionTrigger>
                        <Input
                          className="w-full font-semibold text-base bg-muted border rounded-md focus-visible:ring-2 focus-visible:ring-rose-400"
                          value={section.heading}
                          onChange={(e) =>
                            handleSectionChange(section.id, "heading", e.target.value)
                          }
                        />
                      </AccordionTrigger>
                      <AccordionContent>
                        <Textarea
                          rows={6}
                          value={section.content}
                          onChange={(e) =>
                            handleSectionChange(section.id, "content", e.target.value)
                          }
                          placeholder={`Write content for ${section.heading}...`}
                          className="resize-none w-full mt-2 border bg-muted/50 rounded-md focus-visible:ring-2 focus-visible:ring-rose-400"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-3"
                          onClick={() => removeSection(section.id)}
                        >
                          Delete Section
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>

              <Button variant="outline" className="w-full mt-4" onClick={addSection}>
                + Add Section
              </Button>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleSave}
                className="w-full tracking-tight bg-gradient-to-r from-rose-300 to-rose-600 hover:opacity-90 text-white"
              >
                Save Terms
              </Button>
            </CardFooter>
          </Card>

          {/* Preview Section with Accordion */}
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-muted/40 rounded-t-lg">
              <CardTitle className="text-purple-700">Preview</CardTitle>
              <CardDescription>A live preview of your Terms & Conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                {date && <p className="text-sm text-gray-500 mt-1">Last updated: {date}</p>}
              </div>
              <Separator />
              <Accordion type="single" collapsible className="w-full max-h-[50vh] overflow-y-auto pr-2">
                {sections.map((section) => (
                  <AccordionItem key={section.id} value={`preview-${section.id}`}>
                    <AccordionTrigger>{section.heading || "Untitled Section"}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm leading-relaxed text-foreground">
                        {section.content || (
                          <span className="italic text-gray-400">No content added yet...</span>
                        )}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Terms Saved</DialogTitle>
            <DialogDescription>
              Your Terms & Conditions have been saved successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false)
                document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" })
              }}
              className="bg-gradient-to-r from-rose-300 to-rose-600 text-white"
            >
              View Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TermsConditionSection
