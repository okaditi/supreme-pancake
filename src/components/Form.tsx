"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar, Target, FileText } from "lucide-react"

interface CampaignFormData {
  title: string
  description: string
  target: string
  deadline: string
}

interface CampaignFormProps {
  onSubmit?: (values: CampaignFormData) => void
}

export function CampaignForm({ onSubmit }: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    target: "",
    deadline: "",
  })

  const [errors, setErrors] = useState<Partial<CampaignFormData>>({})

  const validateField = (name: keyof CampaignFormData, value: string) => {
    const newErrors = { ...errors }

    switch (name) {
      case "title":
        if (!value.trim()) {
          newErrors.title = "Title is required"
        } else {
          delete newErrors.title
        }
        break
      case "description":
        if (!value.trim()) {
          newErrors.description = "Description is required"
        } else {
          delete newErrors.description
        }
        break
      case "target":
        const targetNum = Number.parseFloat(value)
        if (!value || isNaN(targetNum) || targetNum <= 0) {
          newErrors.target = "Target must be greater than 0"
        } else {
          delete newErrors.target
        }
        break
      case "deadline":
        if (!value) {
          newErrors.deadline = "Deadline is required"
        } else {
          const deadlineDate = new Date(value)
          const now = new Date()
          if (deadlineDate <= now) {
            newErrors.deadline = "Deadline must be in the future"
          } else {
            delete newErrors.deadline
          }
        }
        break
    }

    setErrors(newErrors)
  }

  const handleInputChange = (name: keyof CampaignFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.target &&
      Number.parseFloat(formData.target) > 0 &&
      formData.deadline &&
      new Date(formData.deadline) > new Date() &&
      Object.keys(errors).length === 0
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid() && onSubmit) {
      onSubmit(formData)
    }
  }

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      target: "",
      deadline: "",
    })
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900 tracking-tight">Create Campaign</CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Launch your fundraising campaign and make an impact
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Campaign Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Save the rainforest"
                  className="h-11 border-gray-200 focus:border-[#0988f0] focus:ring-2 focus:ring-[#0988f0]/20 transition-all duration-200"
                  required
                />
                {errors.title && (
                  <div className="flex items-center gap-1 text-sm text-red-600" aria-live="polite">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  Target Amount (ETH)
                </Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.target}
                  onChange={(e) => handleInputChange("target", e.target.value)}
                  className="h-11 border-gray-200 focus:border-[#0988f0] focus:ring-2 focus:ring-[#0988f0]/20 transition-all duration-200"
                  required
                />
                {errors.target && (
                  <div className="flex items-center gap-1 text-sm text-red-600" aria-live="polite">
                    <AlertCircle className="w-4 h-4" />
                    {errors.target}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Campaign Description
              </Label>
              <Textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="border-gray-200 focus:border-[#0988f0] focus:ring-2 focus:ring-[#0988f0]/20 resize-none transition-all duration-200"
                placeholder="Describe your campaign goals, how funds will be used, and why it matters..."
                required
              />
              <p className="text-xs text-gray-500">Explain why this matters and what the funds will cover</p>
              {errors.description && (
                <div className="flex items-center gap-1 text-sm text-red-600" aria-live="polite">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Campaign Deadline
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                className="h-11 border-gray-200 focus:border-[#0988f0] focus:ring-2 focus:ring-[#0988f0]/20 transition-all duration-200"
                required
              />
              <p className="text-xs text-gray-500">When should your campaign end?</p>
              {errors.deadline && (
                <div className="flex items-center gap-1 text-sm text-red-600" aria-live="polite">
                  <AlertCircle className="w-4 h-4" />
                  {errors.deadline}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!isFormValid()}
                className="flex-1 h-11 bg-[#0988f0] hover:bg-[#0876d9] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Create Campaign
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="h-11 px-6 text-gray-700 border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
