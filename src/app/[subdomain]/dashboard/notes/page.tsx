// "use client"

// import type React from "react"

// import { useState, useRef, useMemo, useCallback, useEffect } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Label } from "@/components/ui/label"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"
// import { Checkbox } from "@/components/ui/checkbox"
// import {
//   Bold,
//   Italic,
//   Underline,
//   List,
//   ListOrdered,
//   Quote,
//   Code,
//   Heading1,
//   Heading2,
//   Heading3,
//   Save,
//   Plus,
//   Search,
//   Tag,
//   Moon,
//   Sun,
//   Settings,
//   ImageIcon,
//   Paperclip,
//   Folder,
//   FolderPlus,
//   BookOpenCheck,
//   ChevronDown,
//   ChevronRight,
//   Filter,
//   CalendarIcon,
//   SortAsc,
//   SortDesc,
//   X,
//   History,
//   Star,
//   Bookmark,
//   Link,
//   ExternalLink,
//   ArrowLeft,
//   Network,
// } from "lucide-react"

// interface Note {
//   id: string
//   title: string
//   content: string
//   tags: string[]
//   folder: string
//   notebook: string
//   backgroundColor: string
//   createdAt: Date
//   updatedAt: Date
//   links: string[] // Array of note IDs that this note links to
// }

// interface NotebookStructure {
//   id: string
//   name: string
//   description: string
//   color: string
//   folders: FolderStructure[]
// }

// interface FolderStructure {
//   id: string
//   name: string
//   notebookId: string
//   parentId?: string
//   children: FolderStructure[]
// }

// interface SavedSearch {
//   id: string
//   name: string
//   query: string
//   filters: {
//     tags: string[]
//     notebook: string
//     folder: string
//     dateRange: { from?: Date; to?: Date }
//     sortBy: string
//     sortOrder: "asc" | "desc"
//   }
// }

// interface NoteLink {
//   id: string
//   title: string
//   preview: string
// }

// const BACKGROUND_COLORS = [
//   { name: "Default", value: "bg-card", color: "#f1f5f9" },
//   { name: "Yellow", value: "bg-yellow-50", color: "#fefce8" },
//   { name: "Green", value: "bg-green-50", color: "#f0fdf4" },
//   { name: "Blue", value: "bg-blue-50", color: "#eff6ff" },
//   { name: "Purple", value: "bg-purple-50", color: "#faf5ff" },
//   { name: "Pink", value: "bg-pink-50", color: "#fdf2f8" },
// ]

// const NOTEBOOK_COLORS = [
//   { name: "Emerald", value: "#10b981" },
//   { name: "Blue", value: "#3b82f6" },
//   { name: "Purple", value: "#8b5cf6" },
//   { name: "Orange", value: "#f97316" },
//   { name: "Pink", value: "#ec4899" },
//   { name: "Indigo", value: "#6366f1" },
// ]

// export default function NotesApp() {
//   const [notebooks, setNotebooks] = useState<NotebookStructure[]>([
//     {
//       id: "1",
//       name: "Personal",
//       description: "Personal notes and thoughts",
//       color: "#10b981",
//       folders: [
//         {
//           id: "1",
//           name: "Getting Started",
//           notebookId: "1",
//           children: [],
//         },
//         {
//           id: "2",
//           name: "General",
//           notebookId: "1",
//           children: [],
//         },
//       ],
//     },
//     {
//       id: "2",
//       name: "Work",
//       description: "Work-related notes and projects",
//       color: "#3b82f6",
//       folders: [
//         {
//           id: "3",
//           name: "Projects",
//           notebookId: "2",
//           children: [],
//         },
//         {
//           id: "4",
//           name: "Meetings",
//           notebookId: "2",
//           children: [],
//         },
//       ],
//     },
//   ])

//   const [notes, setNotes] = useState<Note[]>([
//     {
//       id: "1",
//       title: "Welcome to Your Notes",
//       content:
//         "# Getting Started\n\nThis is your digital notes system. You can:\n\n- Create rich text notes with **bold**, *italic*, and other formatting\n- Organize with tags, folders, and notebooks\n- Search and filter your content\n- Link notes together using [[Note Title]] syntax\n- Create bi-directional links between related notes\n\nTry creating a link: [[My Second Note]]\n\nStart writing your first note!",
//       tags: ["welcome", "tutorial"],
//       folder: "Getting Started",
//       notebook: "Personal",
//       backgroundColor: "bg-card",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       links: [],
//     },
//   ])

//   const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0])
//   const [isEditing, setIsEditing] = useState(false)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedTags, setSelectedTags] = useState<string[]>([])
//   const [selectedNotebook, setSelectedNotebook] = useState<string>("all")
//   const [selectedFolder, setSelectedFolder] = useState<string>("all")
//   const [searchHistory, setSearchHistory] = useState<string[]>([])
//   const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
//   const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
//   const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
//   const [sortBy, setSortBy] = useState<string>("updatedAt")
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
//   const [searchInContent, setSearchInContent] = useState(true)
//   const [searchInTitles, setSearchInTitles] = useState(true)
//   const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
//   const [isDarkMode, setIsDarkMode] = useState(false)
//   const [newTag, setNewTag] = useState("")
//   const [expandedNotebooks, setExpandedNotebooks] = useState<string[]>(["1"])

//   const [showLinkSuggestions, setShowLinkSuggestions] = useState(false)
//   const [linkSuggestionPosition, setLinkSuggestionPosition] = useState({ top: 0, left: 0 })
//   const [currentLinkQuery, setCurrentLinkQuery] = useState("")
//   const [showLinkedNotes, setShowLinkedNotes] = useState(false)
//   const [showBacklinks, setShowBacklinks] = useState(false)

//   const [showNewNotebookDialog, setShowNewNotebookDialog] = useState(false)
//   const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
//   const [newNotebookName, setNewNotebookName] = useState("")
//   const [newNotebookDescription, setNewNotebookDescription] = useState("")
//   const [newNotebookColor, setNewNotebookColor] = useState(NOTEBOOK_COLORS[0].value)
//   const [newFolderName, setNewFolderName] = useState("")
//   const [newFolderNotebook, setNewFolderNotebook] = useState("")

//   const [showSettingsDialog, setShowSettingsDialog] = useState(false)
//   const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")
//   const [autoSave, setAutoSave] = useState(true)
//   const [highContrast, setHighContrast] = useState(false)
//   const [keyboardShortcuts, setKeyboardShortcuts] = useState(true)
//   const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
//   const [errorMessage, setErrorMessage] = useState<string>("")

//   const editorRef = useRef<HTMLTextAreaElement>(null)

//   // Get all unique tags from notes
//   const allTags = Array.from(new Set(notes.flatMap((note) => note.tags)))

//   const exportNotes = useCallback(() => {
//     const dataToExport = {
//       notes,
//       notebooks,
//       savedSearches,
//       exportDate: new Date().toISOString(),
//     }

//     const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `notes-export-${new Date().toISOString().split("T")[0]}.json`
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
//     URL.revokeObjectURL(url)
//   }, [notes, notebooks, savedSearches])

//   const parseNoteLinks = useCallback((content: string): string[] => {
//     const linkRegex = /\[\[([^\]]+)\]\]/g
//     const matches = []
//     let match
//     while ((match = linkRegex.exec(content)) !== null) {
//       matches.push(match[1])
//     }
//     return matches
//   }, [])

//   const getLinkedNotes = useCallback(
//     (note: Note): NoteLink[] => {
//       const linkTitles = parseNoteLinks(note.content)
//       return linkTitles
//         .map((title) => {
//           const linkedNote = notes.find((n) => n.title.toLowerCase() === title.toLowerCase())
//           if (linkedNote) {
//             return {
//               id: linkedNote.id,
//               title: linkedNote.title,
//               preview: linkedNote.content.substring(0, 100) + "...",
//             }
//           }
//           return null
//         })
//         .filter(Boolean) as NoteLink[]
//     },
//     [notes, parseNoteLinks],
//   )

//   const getBacklinks = useCallback(
//     (note: Note): NoteLink[] => {
//       return notes
//         .filter(
//           (n) =>
//             n.id !== note.id &&
//             parseNoteLinks(n.content).some((title) => title.toLowerCase() === note.title.toLowerCase()),
//         )
//         .map((n) => ({
//           id: n.id,
//           title: n.title,
//           preview: n.content.substring(0, 100) + "...",
//         }))
//     },
//     [notes, parseNoteLinks],
//   )

//   const renderContentWithLinks = useCallback(
//     (content: string) => {
//       const linkRegex = /\[\[([^\]]+)\]\]/g
//       const parts = content.split(linkRegex)

//       return parts.map((part, index) => {
//         if (index % 2 === 1) {
//           // This is a link
//           const linkedNote = notes.find((n) => n.title.toLowerCase() === part.toLowerCase())
//           return (
//             <button
//               key={index}
//               onClick={() => {
//                 if (linkedNote) {
//                   setSelectedNote(linkedNote)
//                   setIsEditing(false)
//                 }
//               }}
//               className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium transition-colors ${
//                 linkedNote
//                   ? "text-primary hover:bg-primary/10 border border-primary/20"
//                   : "text-muted-foreground hover:bg-muted border border-dashed border-muted-foreground/30"
//               }`}
//             >
//               <Link className="h-3 w-3" />
//               {part}
//               {!linkedNote && <span className="text-xs opacity-60">(missing)</span>}
//             </button>
//           )
//         }
//         return part
//       })
//     },
//     [notes],
//   )

//   const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const value = e.target.value
//     const cursorPosition = e.target.selectionStart

//     updateNoteContent("content", value)

//     // Check for link syntax
//     const textBeforeCursor = value.substring(0, cursorPosition)
//     const linkMatch = textBeforeCursor.match(/\[\[([^\]]*?)$/)

//     if (linkMatch) {
//       const query = linkMatch[1]
//       setCurrentLinkQuery(query)
//       setShowLinkSuggestions(true)

//       // Calculate position for suggestions
//       const textarea = e.target
//       const rect = textarea.getBoundingClientRect()
//       const textMetrics = getTextMetrics(textarea, textBeforeCursor)

//       setLinkSuggestionPosition({
//         top: rect.top + textMetrics.height + 20,
//         left: rect.left + textMetrics.width,
//       })
//     } else {
//       setShowLinkSuggestions(false)
//       setCurrentLinkQuery("")
//     }
//   }, [])

//   const getTextMetrics = (textarea: HTMLTextAreaElement, text: string) => {
//     const canvas = document.createElement("canvas")
//     const context = canvas.getContext("2d")!
//     const style = window.getComputedStyle(textarea)
//     context.font = `${style.fontSize} ${style.fontFamily}`

//     const lines = text.split("\n")
//     const width = Math.max(...lines.map((line) => context.measureText(line).width))
//     const height = lines.length * Number.parseInt(style.lineHeight || style.fontSize)

//     return { width, height }
//   }

//   const getLinkSuggestions = useCallback(() => {
//     if (!currentLinkQuery) return notes.slice(0, 5)

//     return notes
//       .filter(
//         (note) => note.id !== selectedNote?.id && note.title.toLowerCase().includes(currentLinkQuery.toLowerCase()),
//       )
//       .slice(0, 5)
//   }, [currentLinkQuery, notes, selectedNote])

//     const updateNoteContent = useCallback(
//     (field: keyof Note, value: any) => {
//       if (!selectedNote) return
//       setSelectedNote((prev) => (prev ? { ...prev, [field]: value } : null))
//     },
//     [selectedNote],
//   )

//   const insertLink = useCallback(
//     (noteTitle: string) => {
//       if (!editorRef.current || !selectedNote) return

//       const textarea = editorRef.current
//       const cursorPosition = textarea.selectionStart
//       const content = selectedNote.content

//       // Find the start of the current link being typed
//       const textBeforeCursor = content.substring(0, cursorPosition)
//       const linkMatch = textBeforeCursor.match(/\[\[([^\]]*?)$/)

//       if (linkMatch) {
//         const linkStart = cursorPosition - linkMatch[0].length
//         const newContent = content.substring(0, linkStart) + `[[${noteTitle}]]` + content.substring(cursorPosition)

//         updateNoteContent("content", newContent)

//         // Position cursor after the link
//         setTimeout(() => {
//           const newCursorPosition = linkStart + `[[${noteTitle}]]`.length
//           textarea.focus()
//           textarea.setSelectionRange(newCursorPosition, newCursorPosition)
//         }, 0)
//       }

//       setShowLinkSuggestions(false)
//       setCurrentLinkQuery("")
//     },
//     [selectedNote, updateNoteContent],
//   )

//   const createNoteFromLink = useCallback(
//     (title: string) => {
//       const newNote: Note = {
//         id: Date.now().toString(),
//         title: title,
//         content: `# ${title}\n\nThis note was created from a link.`,
//         tags: [],
//         folder: selectedNote?.folder || "General",
//         notebook: selectedNote?.notebook || "Personal",
//         backgroundColor: "bg-card",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         links: [],
//       }

//       setNotes((prev) => [newNote, ...prev])
//       insertLink(title)
//     },
//     [selectedNote, insertLink],
//   )

//   const highlightText = (text: string, query: string) => {
//     if (!query.trim()) return text
//     const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
//     return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
//   }

//   const filteredNotes = useMemo(() => {
//     const filtered = notes.filter((note) => {
//       // Text search
//       const searchLower = searchQuery.toLowerCase()
//       const titleMatch = searchInTitles && note.title.toLowerCase().includes(searchLower)
//       const contentMatch = searchInContent && note.content.toLowerCase().includes(searchLower)
//       const matchesSearch = !searchQuery.trim() || titleMatch || contentMatch

//       // Tag filter
//       const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => note.tags.includes(tag))

//       // Notebook filter
//       const matchesNotebook = selectedNotebook === "all" || note.notebook === selectedNotebook

//       // Folder filter
//       const matchesFolder = selectedFolder === "all" || note.folder === selectedFolder

//       // Date range filter
//       const matchesDateRange =
//         !dateRange.from || !dateRange.to || (note.updatedAt >= dateRange.from && note.updatedAt <= dateRange.to)

//       return matchesSearch && matchesTags && matchesNotebook && matchesFolder && matchesDateRange
//     })

//     // Sort results
//     filtered.sort((a, b) => {
//       let comparison = 0
//       switch (sortBy) {
//         case "title":
//           comparison = a.title.localeCompare(b.title)
//           break
//         case "createdAt":
//           comparison = a.createdAt.getTime() - b.createdAt.getTime()
//           break
//         case "updatedAt":
//         default:
//           comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
//           break
//       }
//       return sortOrder === "asc" ? comparison : -comparison
//     })

//     return filtered
//   }, [
//     notes,
//     searchQuery,
//     selectedTags,
//     selectedNotebook,
//     selectedFolder,
//     dateRange,
//     sortBy,
//     sortOrder,
//     searchInTitles,
//     searchInContent,
//   ])

//   const handleSearch = (query: string) => {
//     setSearchQuery(query)
//     if (query.trim() && !searchHistory.includes(query.trim())) {
//       setSearchHistory((prev) => [query.trim(), ...prev.slice(0, 9)]) // Keep last 10 searches
//     }
//   }

//   const saveCurrentSearch = () => {
//     if (!searchQuery.trim()) return

//     const searchName = prompt("Enter a name for this search:")
//     if (!searchName) return

//     const newSavedSearch: SavedSearch = {
//       id: Date.now().toString(),
//       name: searchName,
//       query: searchQuery,
//       filters: {
//         tags: selectedTags,
//         notebook: selectedNotebook,
//         folder: selectedFolder,
//         dateRange,
//         sortBy,
//         sortOrder,
//       },
//     }

//     setSavedSearches((prev) => [...prev, newSavedSearch])
//   }

//   const loadSavedSearch = (savedSearch: SavedSearch) => {
//     setSearchQuery(savedSearch.query)
//     setSelectedTags(savedSearch.filters.tags)
//     setSelectedNotebook(savedSearch.filters.notebook)
//     setSelectedFolder(savedSearch.filters.folder)
//     setDateRange(savedSearch.filters.dateRange)
//     setSortBy(savedSearch.filters.sortBy)
//     setSortOrder(savedSearch.filters.sortOrder)
//   }

//   const clearAllFilters = () => {
//     setSearchQuery("")
//     setSelectedTags([])
//     setSelectedNotebook("all")
//     setSelectedFolder("all")
//     setDateRange({})
//     setSortBy("updatedAt")
//     setSortOrder("desc")
//   }

//   const getSearchSuggestions = () => {
//     const suggestions = new Set<string>()

//     // Add recent searches
//     searchHistory.forEach((search) => suggestions.add(search))

//     // Add note titles that match current query
//     if (searchQuery.length > 1) {
//       notes.forEach((note) => {
//         if (note.title.toLowerCase().includes(searchQuery.toLowerCase())) {
//           suggestions.add(note.title)
//         }
//       })
//     }

//     // Add tags that match current query
//     allTags.forEach((tag) => {
//       if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
//         suggestions.add(`tag:${tag}`)
//       }
//     })

//     return Array.from(suggestions).slice(0, 8)
//   }

//   const createNewNote = () => {
//     const currentNotebook = selectedNotebook !== "all" ? selectedNotebook : "Personal"
//     const currentFolder = selectedFolder !== "all" ? selectedFolder : "General"

//     const newNote: Note = {
//       id: Date.now().toString(),
//       title: "Untitled Note",
//       content: "",
//       tags: [],
//       folder: currentFolder,
//       notebook: currentNotebook,
//       backgroundColor: "bg-card",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       links: [],
//     }
//     setNotes((prev) => [newNote, ...prev])
//     setSelectedNote(newNote)
//     setIsEditing(true)
//   }

//   const createNotebook = () => {
//     if (!newNotebookName.trim()) return

//     const newNotebook: NotebookStructure = {
//       id: Date.now().toString(),
//       name: newNotebookName.trim(),
//       description: newNotebookDescription.trim(),
//       color: newNotebookColor,
//       folders: [
//         {
//           id: `${Date.now()}-general`,
//           name: "General",
//           notebookId: Date.now().toString(),
//           children: [],
//         },
//       ],
//     }

//     setNotebooks((prev) => [...prev, newNotebook])
//     setNewNotebookName("")
//     setNewNotebookDescription("")
//     setNewNotebookColor(NOTEBOOK_COLORS[0].value)
//     setShowNewNotebookDialog(false)
//   }

//   const createFolder = () => {
//     if (!newFolderName.trim() || !newFolderNotebook) return

//     const newFolder: FolderStructure = {
//       id: Date.now().toString(),
//       name: newFolderName.trim(),
//       notebookId: newFolderNotebook,
//       children: [],
//     }

//     setNotebooks((prev) =>
//       prev.map((notebook) =>
//         notebook.id === newFolderNotebook ? { ...notebook, folders: [...notebook.folders, newFolder] } : notebook,
//       ),
//     )

//     setNewFolderName("")
//     setNewFolderNotebook("")
//     setShowNewFolderDialog(false)
//   }

//   const toggleNotebookExpansion = (notebookId: string) => {
//     setExpandedNotebooks((prev) =>
//       prev.includes(notebookId) ? prev.filter((id) => id !== notebookId) : [...prev, notebookId],
//     )
//   }

//   const saveNote = useCallback(() => {
//     if (!selectedNote) return

//     setNotes((prev) =>
//       prev.map((note) => (note.id === selectedNote.id ? { ...selectedNote, updatedAt: new Date() } : note)),
//     )
//     setIsEditing(false)
//   }, [selectedNote])



//   const addTag = () => {
//     if (!newTag.trim() || !selectedNote) return
//     const updatedTags = [...selectedNote.tags, newTag.trim()]
//     updateNoteContent("tags", updatedTags)
//     setNewTag("")
//   }

//   const removeTag = (tagToRemove: string) => {
//     if (!selectedNote) return
//     const updatedTags = selectedNote.tags.filter((tag) => tag !== tagToRemove)
//     updateNoteContent("tags", updatedTags)
//   }

//   const formatText = (format: string) => {
//     if (!editorRef.current || !selectedNote) return

//     const textarea = editorRef.current
//     const start = textarea.selectionStart
//     const end = textarea.selectionEnd
//     const selectedText = selectedNote.content.substring(start, end)

//     let formattedText = ""
//     let newContent = ""

//     switch (format) {
//       case "bold":
//         formattedText = `**${selectedText}**`
//         break
//       case "italic":
//         formattedText = `*${selectedText}*`
//         break
//       case "underline":
//         formattedText = `<u>${selectedText}</u>`
//         break
//       case "h1":
//         formattedText = `# ${selectedText}`
//         break
//       case "h2":
//         formattedText = `## ${selectedText}`
//         break
//       case "h3":
//         formattedText = `### ${selectedText}`
//         break
//       case "quote":
//         formattedText = `> ${selectedText}`
//         break
//       case "code":
//         formattedText = `\`${selectedText}\``
//         break
//       case "list":
//         formattedText = `- ${selectedText}`
//         break
//       case "orderedList":
//         formattedText = `1. ${selectedText}`
//         break
//       case "link":
//         formattedText = `[[${selectedText}]]`
//         break
//     }

//     newContent = selectedNote.content.substring(0, start) + formattedText + selectedNote.content.substring(end)
//     updateNoteContent("content", newContent)

//     // Restore cursor position
//     setTimeout(() => {
//       textarea.focus()
//       textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
//     }, 0)
//   }

//   const toggleDarkMode = () => {
//     setIsDarkMode(!isDarkMode)
//     document.documentElement.classList.toggle("dark")
//   }

//   useEffect(() => {
//     if (!keyboardShortcuts) return

//     const handleKeyDown = (e: KeyboardEvent) => {
//       // Ctrl/Cmd + N: New note
//       if ((e.ctrlKey || e.metaKey) && e.key === "n") {
//         e.preventDefault()
//         createNewNote()
//       }
//       // Ctrl/Cmd + S: Save note
//       if ((e.ctrlKey || e.metaKey) && e.key === "s") {
//         e.preventDefault()
//         if (isEditing) saveNote()
//       }
//       // Ctrl/Cmd + F: Focus search
//       if ((e.ctrlKey || e.metaKey) && e.key === "f") {
//         e.preventDefault()
//         const searchInput = document.querySelector('input[placeholder="Search notes..."]') as HTMLInputElement
//         searchInput?.focus()
//       }
//       // Ctrl/Cmd + E: Toggle edit mode
//       if ((e.ctrlKey || e.metaKey) && e.key === "e") {
//         e.preventDefault()
//         if (selectedNote) {
//           isEditing ? saveNote() : setIsEditing(true)
//         }
//       }
//       // Escape: Exit edit mode
//       if (e.key === "Escape" && isEditing) {
//         setIsEditing(false)
//       }
//       // Ctrl/Cmd + ?: Show keyboard shortcuts
//       if ((e.ctrlKey || e.metaKey) && e.key === "/") {
//         e.preventDefault()
//         setShowKeyboardShortcuts(true)
//       }
//     }

//     document.addEventListener("keydown", handleKeyDown)
//     return () => document.removeEventListener("keydown", handleKeyDown)
//   }, [keyboardShortcuts, isEditing, selectedNote, createNewNote, saveNote])

//   useEffect(() => {
//     if (!autoSave || !selectedNote || !isEditing) return

//     const autoSaveTimer = setTimeout(() => {
//       saveNote()
//     }, 3000) // Auto-save after 3 seconds of inactivity

//     return () => clearTimeout(autoSaveTimer)
//   }, [selectedNote, autoSave, isEditing, saveNote])

//   useEffect(() => {
//     const root = document.documentElement
//     root.className = root.className.replace(/font-size-\w+/g, "")
//     root.classList.add(`font-size-${fontSize}`)

//     if (highContrast) {
//       root.classList.add("high-contrast")
//     } else {
//       root.classList.remove("high-contrast")
//     }
//   }, [fontSize, highContrast])

//   const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     const reader = new FileReader()
//     reader.onload = (e) => {
//       try {
//         const importedData = JSON.parse(e.target?.result as string)
//         if (importedData.notes && Array.isArray(importedData.notes)) {
//           setNotes(importedData.notes)
//           setNotebooks(importedData.notebooks || [])
//           setErrorMessage("")
//         } else {
//           setErrorMessage("Invalid file format")
//         }
//       } catch {
//         setErrorMessage("Invalid file format")
//       }
//     }
//     reader.readAsText(file)
//   }

//   const [folders, setFolders] = useState<FolderStructure[]>([])

//   return (
//     <div
//       className={`min-h-screen bg-background ${isDarkMode ? "dark" : ""} ${highContrast ? "high-contrast" : ""} font-size-${fontSize}`}
//     >
//       <div className="flex h-screen">
//         {/* Left Sidebar - Navigation & Notes List */}
//         <div className="w-80 border-r border-border bg-sidebar overflow-y-auto">
//           <div className="p-4 border-b border-sidebar-border">
//             <div className="flex items-center justify-between mb-4">
//               <h1 className="text-xl font-bold text-sidebar-foreground">Notes</h1>
//               <div className="flex gap-2">
//                 <Button size="sm" variant="ghost" onClick={toggleDarkMode} aria-label="Toggle dark mode">
//                   {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//                 </Button>
//                 <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
//                   <DialogTrigger asChild>
//                     <Button size="sm" variant="ghost" aria-label="Open settings">
//                       <Settings className="h-4 w-4" />
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-md">
//                     <DialogHeader>
//                       <DialogTitle>Settings</DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-6">
//                       {/* Appearance Settings */}
//                       <div>
//                         <h3 className="text-sm font-medium mb-3">Appearance</h3>
//                         <div className="space-y-3">
//                           <div className="flex items-center justify-between">
//                             <Label htmlFor="font-size">Font Size</Label>
//                             <Select
//                               value={fontSize}
//                               onValueChange={(value: "small" | "medium" | "large") => setFontSize(value)}
//                             >
//                               <SelectTrigger className="w-24">
//                                 <SelectValue />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="small">Small</SelectItem>
//                                 <SelectItem value="medium">Medium</SelectItem>
//                                 <SelectItem value="large">Large</SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <Label htmlFor="high-contrast">High Contrast</Label>
//                             <Checkbox id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Editor Settings */}
//                       <div>
//                         <h3 className="text-sm font-medium mb-3">Editor</h3>
//                         <div className="space-y-3">
//                           <div className="flex items-center justify-between">
//                             <Label htmlFor="auto-save">Auto Save</Label>
//                             <Checkbox id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
//                           </div>
//                           <div className="flex items-center justify-between">
//                             <Label htmlFor="keyboard-shortcuts">Keyboard Shortcuts</Label>
//                             <Checkbox
//                               id="keyboard-shortcuts"
//                               checked={keyboardShortcuts}
//                               onCheckedChange={setKeyboardShortcuts}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Data Management */}
//                       <div>
//                         <h3 className="text-sm font-medium mb-3">Data</h3>
//                         <div className="space-y-2">
//                           <Button
//                             onClick={exportNotes}
//                             variant="outline"
//                             className="w-full justify-start bg-transparent"
//                           >
//                             Export Notes
//                           </Button>
//                           <div>
//                             <input
//                               type="file"
//                               accept=".json"
//                               onChange={importNotes}
//                               className="hidden"
//                               id="import-file"
//                             />
//                             <Button
//                               onClick={() => document.getElementById("import-file")?.click()}
//                               variant="outline"
//                               className="w-full justify-start"
//                             >
//                               Import Notes
//                             </Button>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Help */}
//                       <div>
//                         <h3 className="text-sm font-medium mb-3">Help</h3>
//                         <Button
//                           onClick={() => setShowKeyboardShortcuts(true)}
//                           variant="outline"
//                           className="w-full justify-start"
//                         >
//                           Keyboard Shortcuts
//                         </Button>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </div>

//             <Button onClick={createNewNote} className="w-full mb-4" aria-label="Create new note">
//               <Plus className="h-4 w-4 mr-2" />
//               New Note
//             </Button>

//             {/* Enhanced Search */}
//             <div className="space-y-3 mb-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search notes..."
//                   value={searchQuery}
//                   onChange={(e) => handleSearch(e.target.value)}
//                   onFocus={() => setShowSearchSuggestions(true)}
//                   onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
//                   className="pl-10 pr-10"
//                   aria-label="Search notes"
//                 />
//                 {searchQuery && (
//                   <Button
//                     size="sm"
//                     variant="ghost"
//                     onClick={() => setSearchQuery("")}
//                     className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
//                   >
//                     <X className="h-3 w-3" />
//                   </Button>
//                 )}

//                 {/* Search Suggestions */}
//                 {showSearchSuggestions && searchQuery && (
//                   <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
//                     {getSearchSuggestions().map((suggestion, index) => (
//                       <button
//                         key={index}
//                         className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
//                         onClick={() => {
//                           setSearchQuery(suggestion.startsWith("tag:") ? suggestion.slice(4) : suggestion)
//                           setShowSearchSuggestions(false)
//                         }}
//                       >
//                         {suggestion.startsWith("tag:") ? (
//                           <div className="flex items-center gap-2">
//                             <Tag className="h-3 w-3" />
//                             {suggestion.slice(4)}
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-2">
//                             <Search className="h-3 w-3" />
//                             {suggestion}
//                           </div>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Search Controls */}
//               <div className="flex gap-2">
//                 <Dialog open={showAdvancedSearch} onOpenChange={setShowAdvancedSearch}>
//                   <DialogTrigger asChild>
//                     <Button size="sm" variant="outline" className="flex-1 bg-transparent">
//                       <Filter className="h-3 w-3 mr-1" />
//                       Advanced
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-md">
//                     <DialogHeader>
//                       <DialogTitle>Advanced Search</DialogTitle>
//                     </DialogHeader>
//                     <div className="space-y-4">
//                       <div>
//                         <Label className="text-sm font-medium">Search In</Label>
//                         <div className="flex gap-4 mt-2">
//                           <div className="flex items-center space-x-2">
//                             <Checkbox id="search-titles" checked={searchInTitles} onCheckedChange={setSearchInTitles} />
//                             <Label htmlFor="search-titles" className="text-sm">
//                               Titles
//                             </Label>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <Checkbox
//                               id="search-content"
//                               checked={searchInContent}
//                               onCheckedChange={setSearchInContent}
//                             />
//                             <Label htmlFor="search-content" className="text-sm">
//                               Content
//                             </Label>
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <Label className="text-sm font-medium">Date Range</Label>
//                         <div className="flex gap-2 mt-2">
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <Button variant="outline" size="sm" className="flex-1 bg-transparent">
//                                 <CalendarIcon className="h-3 w-3 mr-1" />
//                                 {dateRange.from ? dateRange.from.toLocaleDateString() : "From"}
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0">
//                               <Calendar
//                                 mode="single"
//                                 selected={dateRange.from}
//                                 onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
//                               />
//                             </PopoverContent>
//                           </Popover>
//                           <Popover>
//                             <PopoverTrigger asChild>
//                               <Button variant="outline" size="sm" className="flex-1 bg-transparent">
//                                 <CalendarIcon className="h-3 w-3 mr-1" />
//                                 {dateRange.to ? dateRange.to.toLocaleDateString() : "To"}
//                               </Button>
//                             </PopoverTrigger>
//                             <PopoverContent className="w-auto p-0">
//                               <Calendar
//                                 mode="single"
//                                 selected={dateRange.to}
//                                 onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
//                               />
//                             </PopoverContent>
//                           </Popover>
//                         </div>
//                       </div>

//                       <div>
//                         <Label className="text-sm font-medium">Sort By</Label>
//                         <div className="flex gap-2 mt-2">
//                           <Select value={sortBy} onValueChange={setSortBy}>
//                             <SelectTrigger className="flex-1">
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="updatedAt">Last Modified</SelectItem>
//                               <SelectItem value="createdAt">Created Date</SelectItem>
//                               <SelectItem value="title">Title</SelectItem>
//                             </SelectContent>
//                           </Select>
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
//                           >
//                             {sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
//                           </Button>
//                         </div>
//                       </div>

//                       <div className="flex gap-2">
//                         <Button onClick={clearAllFilters} variant="outline" className="flex-1 bg-transparent">
//                           Clear All
//                         </Button>
//                         <Button onClick={() => setShowAdvancedSearch(false)} className="flex-1">
//                           Apply
//                         </Button>
//                       </div>
//                     </div>
//                   </DialogContent>
//                 </Dialog>

//                 {searchQuery && (
//                   <Button size="sm" variant="outline" onClick={saveCurrentSearch}>
//                     <Bookmark className="h-3 w-3" />
//                   </Button>
//                 )}
//               </div>

//               {/* Active Filters Display */}
//               {(selectedTags.length > 0 ||
//                 selectedNotebook !== "all" ||
//                 selectedFolder !== "all" ||
//                 dateRange.from ||
//                 dateRange.to) && (
//                 <div className="flex flex-wrap gap-1">
//                   {selectedTags.map((tag) => (
//                     <Badge key={tag} variant="secondary" className="text-xs">
//                       {tag}
//                       <button
//                         onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tag))}
//                         className="ml-1 hover:text-destructive"
//                       >
//                         ×
//                       </button>
//                     </Badge>
//                   ))}
//                   {selectedNotebook !== "all" && (
//                     <Badge variant="secondary" className="text-xs">
//                       Notebook: {selectedNotebook}
//                       <button onClick={() => setSelectedNotebook("all")} className="ml-1 hover:text-destructive">
//                         ×
//                       </button>
//                     </Badge>
//                   )}
//                   {selectedFolder !== "all" && (
//                     <Badge variant="secondary" className="text-xs">
//                       Folder: {selectedFolder}
//                       <button onClick={() => setSelectedFolder("all")} className="ml-1 hover:text-destructive">
//                         ×
//                       </button>
//                     </Badge>
//                   )}
//                   {(dateRange.from || dateRange.to) && (
//                     <Badge variant="secondary" className="text-xs">
//                       Date Range
//                       <button onClick={() => setDateRange({})} className="ml-1 hover:text-destructive">
//                         ×
//                       </button>
//                     </Badge>
//                   )}
//                 </div>
//               )}

//               {/* Search Results Count */}
//               {searchQuery && (
//                 <div className="text-xs text-muted-foreground">
//                   {filteredNotes.length} result{filteredNotes.length !== 1 ? "s" : ""} found
//                 </div>
//               )}
//             </div>

//             {errorMessage && (
//               <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
//                 <p className="text-sm text-destructive">{errorMessage}</p>
//                 <Button variant="ghost" size="sm" onClick={() => setErrorMessage("")} className="mt-1 h-6 px-2">
//                   Dismiss
//                 </Button>
//               </div>
//             )}

//             <div className="space-y-4 mb-4">
//               {/* Notebook Filter */}
//               <div>
//                 <Label className="text-sm font-medium text-sidebar-foreground">Notebook</Label>
//                 <Select value={selectedNotebook} onValueChange={setSelectedNotebook}>
//                   <SelectTrigger className="w-full mt-1">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Notebooks</SelectItem>
//                     {notebooks.map((notebook) => (
//                       <SelectItem key={notebook.id} value={notebook.name}>
//                         <div className="flex items-center gap-2">
//                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: notebook.color }} />
//                           {notebook.name}
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Folder Filter */}
//               <div>
//                 <Label className="text-sm font-medium text-sidebar-foreground">Folder</Label>
//                 <Select value={selectedFolder} onValueChange={setSelectedFolder}>
//                   <SelectTrigger className="w-full mt-1">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Folders</SelectItem>
//                     {notebooks.flatMap((notebook) =>
//                       notebook.folders.map((folder) => (
//                         <SelectItem key={folder.id} value={folder.name}>
//                           <div className="flex items-center gap-2">
//                             <Folder className="w-3 h-3" />
//                             {folder.name}
//                           </div>
//                         </SelectItem>
//                       )),
//                     )}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Tag Filter */}
//             <div className="mb-4">
//               <h3 className="text-sm font-medium mb-2 text-sidebar-foreground">Filter by Tags</h3>
//               <div className="flex flex-wrap gap-1">
//                 {allTags.map((tag) => (
//                   <Badge
//                     key={tag}
//                     variant={selectedTags.includes(tag) ? "default" : "secondary"}
//                     className="cursor-pointer text-xs"
//                     onClick={() => {
//                       setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
//                     }}
//                   >
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             </div>

//             {/* Saved Searches */}
//             {savedSearches.length > 0 && (
//               <div className="mb-4">
//                 <h3 className="text-sm font-medium mb-2 text-sidebar-foreground">Saved Searches</h3>
//                 <div className="space-y-1">
//                   {savedSearches.map((savedSearch) => (
//                     <button
//                       key={savedSearch.id}
//                       onClick={() => loadSavedSearch(savedSearch)}
//                       className="w-full text-left p-2 rounded text-xs hover:bg-sidebar-accent/10 flex items-center gap-2"
//                     >
//                       <Star className="h-3 w-3" />
//                       <span className="truncate">{savedSearch.name}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Search History */}
//             {searchHistory.length > 0 && (
//               <div className="mb-4">
//                 <h3 className="text-sm font-medium mb-2 text-sidebar-foreground">Recent Searches</h3>
//                 <div className="space-y-1">
//                   {searchHistory.slice(0, 5).map((search, index) => (
//                     <button
//                       key={index}
//                       onClick={() => setSearchQuery(search)}
//                       className="w-full text-left p-1 rounded text-xs hover:bg-sidebar-accent/10 flex items-center gap-2"
//                     >
//                       <History className="h-3 w-3" />
//                       <span className="truncate">{search}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="p-4 border-b border-sidebar-border">
//             <h3 className="text-sm font-medium mb-3 text-sidebar-foreground">Organization</h3>

//             {/* Notebooks Tree */}
//             <div className="space-y-2">
//               {notebooks.map((notebook) => (
//                 <div key={notebook.id}>
//                   <div className="flex items-center justify-between group">
//                     <div
//                       className="flex items-center gap-2 cursor-pointer flex-1 p-1 rounded hover:bg-sidebar-accent/10"
//                       onClick={() => toggleNotebookExpansion(notebook.id)}
//                     >
//                       {expandedNotebooks.includes(notebook.id) ? (
//                         <ChevronDown className="w-3 h-3" />
//                       ) : (
//                         <ChevronRight className="w-3 h-3" />
//                       )}
//                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: notebook.color }} />
//                       <BookOpenCheck className="w-3 h-3" />
//                       <span className="text-xs font-medium">{notebook.name}</span>
//                     </div>
//                   </div>

//                   {expandedNotebooks.includes(notebook.id) && (
//                     <div className="ml-6 mt-1 space-y-1">
//                       {notebook.folders.map((folder) => (
//                         <div
//                           key={folder.id}
//                           className="flex items-center gap-2 p-1 rounded hover:bg-sidebar-accent/10 cursor-pointer"
//                         >
//                           <Folder className="w-3 h-3 text-muted-foreground" />
//                           <span className="text-xs text-muted-foreground">{folder.name}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Organization Actions */}
//             <div className="flex gap-2 mt-3">
//               <Dialog open={showNewNotebookDialog} onOpenChange={setShowNewNotebookDialog}>
//                 <DialogTrigger asChild>
//                   <Button size="sm" variant="outline" className="flex-1 bg-transparent">
//                     <Plus className="w-3 h-3 mr-1" />
//                     Notebook
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Create New Notebook</DialogTitle>
//                   </DialogHeader>
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="notebook-name">Name</Label>
//                       <Input
//                         id="notebook-name"
//                         value={newNotebookName}
//                         onChange={(e) => setNewNotebookName(e.target.value)}
//                         placeholder="Enter notebook name..."
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="notebook-description">Description</Label>
//                       <Input
//                         id="notebook-description"
//                         value={newNotebookDescription}
//                         onChange={(e) => setNewNotebookDescription(e.target.value)}
//                         placeholder="Enter description..."
//                       />
//                     </div>
//                     <div>
//                       <Label>Color</Label>
//                       <div className="flex gap-2 mt-2">
//                         {NOTEBOOK_COLORS.map((color) => (
//                           <button
//                             key={color.value}
//                             className={`w-6 h-6 rounded-full border-2 ${
//                               newNotebookColor === color.value ? "border-primary" : "border-transparent"
//                             }`}
//                             style={{ backgroundColor: color.value }}
//                             onClick={() => setNewNotebookColor(color.value)}
//                           />
//                         ))}
//                       </div>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button onClick={createNotebook} className="flex-1">
//                         Create
//                       </Button>
//                       <Button variant="outline" onClick={() => setShowNewNotebookDialog(false)}>
//                         Cancel
//                       </Button>
//                     </div>
//                   </div>
//                 </DialogContent>
//               </Dialog>

//               <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
//                 <DialogTrigger asChild>
//                   <Button size="sm" variant="outline" className="flex-1 bg-transparent">
//                     <FolderPlus className="w-3 h-3 mr-1" />
//                     Folder
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Create New Folder</DialogTitle>
//                   </DialogHeader>
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="folder-name">Name</Label>
//                       <Input
//                         id="folder-name"
//                         value={newFolderName}
//                         onChange={(e) => setNewFolderName(e.target.value)}
//                         placeholder="Enter folder name..."
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="folder-notebook">Notebook</Label>
//                       <Select value={newFolderNotebook} onValueChange={setNewFolderNotebook}>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select notebook..." />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {notebooks.map((notebook) => (
//                             <SelectItem key={notebook.id} value={notebook.id}>
//                               <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: notebook.color }} />
//                                 {notebook.name}
//                               </div>
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button onClick={createFolder} className="flex-1">
//                         Create
//                       </Button>
//                       <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
//                         Cancel
//                       </Button>
//                     </div>
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </div>

//           {/* Notes List */}
//           <div className="p-2">
//             {filteredNotes.map((note) => (
//               <Card
//                 key={note.id}
//                 className={`mb-2 cursor-pointer transition-colors hover:bg-sidebar-accent/10 ${
//                   selectedNote?.id === note.id ? "ring-2 ring-sidebar-primary" : ""
//                 }`}
//                 onClick={() => {
//                   setSelectedNote(note)
//                   setIsEditing(false)
//                 }}
//               >
//                 <CardContent className="p-3">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h3
//                       className="font-medium text-sm truncate flex-1"
//                       dangerouslySetInnerHTML={{
//                         __html: highlightText(note.title, searchQuery),
//                       }}
//                     />
//                     <div
//                       className="w-2 h-2 rounded-full flex-shrink-0"
//                       style={{
//                         backgroundColor: notebooks.find((nb) => nb.name === note.notebook)?.color || "#10b981",
//                       }}
//                     />
//                   </div>
//                   <p
//                     className="text-xs text-muted-foreground mb-2 line-clamp-2"
//                     dangerouslySetInnerHTML={{
//                       __html: highlightText(
//                         note.content.replace(/[#*>`-]/g, "").substring(0, 100) + "...",
//                         searchQuery,
//                       ),
//                     }}
//                   />
//                   <div className="flex items-center justify-between">
//                     <div className="flex gap-1">
//                       <Badge variant="outline" className="text-xs px-1 py-0">
//                         <Folder className="w-2 h-2 mr-1" />
//                         {note.folder}
//                       </Badge>
//                       {note.tags.slice(0, 1).map((tag) => (
//                         <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
//                           {tag}
//                         </Badge>
//                       ))}
//                       {note.tags.length > 1 && (
//                         <Badge variant="secondary" className="text-xs px-1 py-0">
//                           +{note.tags.length - 1}
//                         </Badge>
//                       )}
//                       {getLinkedNotes(note).length > 0 && (
//                         <Badge variant="outline" className="text-xs px-1 py-0">
//                           <Link className="w-2 h-2 mr-1" />
//                           {getLinkedNotes(note).length}
//                         </Badge>
//                       )}
//                     </div>
//                     <span className="text-xs text-muted-foreground">{note.updatedAt.toLocaleDateString()}</span>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Main Content - Note Editor */}
//         <div className="flex-1 flex flex-col">
//           {selectedNote ? (
//             <>
//               {/* Editor Header */}
//               <div className="border-b border-border p-4 bg-card">
//                 <div className="flex items-center justify-between mb-4">
//                   <Input
//                     value={selectedNote.title}
//                     onChange={(e) => updateNoteContent("title", e.target.value)}
//                     className="text-lg font-semibold border-none shadow-none p-0 h-auto bg-transparent"
//                     placeholder="Note title..."
//                   />
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => setShowLinkedNotes(!showLinkedNotes)}
//                       className={showLinkedNotes ? "bg-accent" : ""}
//                     >
//                       <Network className="h-4 w-4 mr-1" />
//                       Links ({getLinkedNotes(selectedNote).length})
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => setShowBacklinks(!showBacklinks)}
//                       className={showBacklinks ? "bg-accent" : ""}
//                     >
//                       <ArrowLeft className="h-4 w-4 mr-1" />
//                       Backlinks ({getBacklinks(selectedNote).length})
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant={isEditing ? "default" : "outline"}
//                       onClick={() => (isEditing ? saveNote() : setIsEditing(true))}
//                     >
//                       <Save className="h-4 w-4 mr-2" />
//                       {isEditing ? "Save" : "Edit"}
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4 mb-4">
//                   <div className="flex items-center gap-2">
//                     <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
//                     {isEditing ? (
//                       <Select
//                         value={selectedNote.notebook}
//                         onValueChange={(value) => updateNoteContent("notebook", value)}
//                       >
//                         <SelectTrigger className="h-6 text-xs w-32">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {notebooks.map((notebook) => (
//                             <SelectItem key={notebook.id} value={notebook.name}>
//                               <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: notebook.color }} />
//                                 {notebook.name}
//                               </div>
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <Badge variant="outline" className="text-xs">
//                         <div
//                           className="w-2 h-2 rounded-full mr-1"
//                           style={{
//                             backgroundColor:
//                               notebooks.find((nb) => nb.name === selectedNote.notebook)?.color || "#10b981",
//                           }}
//                         />
//                         {selectedNote.notebook}
//                       </Badge>
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <Folder className="h-4 w-4 text-muted-foreground" />
//                     {isEditing ? (
//                       <Select value={selectedNote.folder} onValueChange={(value) => updateNoteContent("folder", value)}>
//                         <SelectTrigger className="h-6 text-xs w-32">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {notebooks
//                             .find((nb) => nb.name === selectedNote.notebook)
//                             ?.folders.map((folder) => (
//                               <SelectItem key={folder.id} value={folder.name}>
//                                 {folder.name}
//                               </SelectItem>
//                             )) || []}
//                         </SelectContent>
//                       </Select>
//                     ) : (
//                       <Badge variant="outline" className="text-xs">
//                         <Folder className="w-2 h-2 mr-1" />
//                         {selectedNote.folder}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>

//                 {/* Tags */}
//                 <div className="flex items-center gap-2 mb-4">
//                   <Tag className="h-4 w-4 text-muted-foreground" />
//                   <div className="flex flex-wrap gap-1 flex-1">
//                     {selectedNote.tags.map((tag) => (
//                       <Badge key={tag} variant="secondary" className="text-xs">
//                         {tag}
//                         {isEditing && (
//                           <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
//                             ×
//                           </button>
//                         )}
//                       </Badge>
//                     ))}
//                     {isEditing && (
//                       <div className="flex gap-1">
//                         <Input
//                           value={newTag}
//                           onChange={(e) => setNewTag(e.target.value)}
//                           placeholder="Add tag..."
//                           className="h-6 text-xs w-20"
//                           onKeyDown={(e) => e.key === "Enter" && addTag()}
//                         />
//                         <Button size="sm" variant="ghost" onClick={addTag} className="h-6 px-2">
//                           +
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Formatting Toolbar */}
//                 {isEditing && (
//                   <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-lg">
//                     <Button size="sm" variant="ghost" onClick={() => formatText("bold")}>
//                       <Bold className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => formatText("italic")}>
//                       <Italic className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => formatText("underline")}>
//                       <Underline className="h-4 w-4" />
//                     </Button>
//                     <div className="w-px bg-border mx-1" />
//                     <Button size="sm" variant="ghost" onClick={() => formatText("h1")}>
//                       <Heading1 className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => formatText("h2")}>
//                       <Heading2 className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => formatText("h3")}>
//                       <Heading3 className="h-4 w-4" />
//                     </Button>
//                     <div className="w-px bg-border mx-1" />
//                     <Button size="sm" variant="ghost" onClick={() => formatText("list")}>
//                       <List className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => formatText("orderedList")}>
//                       <ListOrdered className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => formatText("quote")}>
//                       <Quote className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost" onClick={() => formatText("code")}>
//                       <Code className="h-4 w-4" />
//                     </Button>
//                     <div className="w-px bg-border mx-1" />
//                     <Button size="sm" variant="ghost" onClick={() => formatText("link")}>
//                       <Link className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost">
//                       <ImageIcon className="h-4 w-4" />
//                     </Button>
//                     <Button size="sm" variant="ghost">
//                       <Paperclip className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               <div className="flex flex-1">
//                 {/* Editor Content */}
//                 <div className="flex-1 p-6">
//                   <Card className={`h-full ${selectedNote.backgroundColor}`}>
//                     <CardContent className="p-6 h-full">
//                       {isEditing ? (
//                         <div className="relative h-full">
//                           <Textarea
//                             ref={editorRef}
//                             value={selectedNote.content}
//                             onChange={handleTextareaChange}
//                             placeholder="Start writing your note... Use [[Note Title]] to link to other notes."
//                             className="w-full h-full resize-none border-none shadow-none bg-transparent text-base leading-relaxed"
//                           />
//                           {showLinkSuggestions && (
//                             <div
//                               className="fixed bg-popover border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto min-w-48"
//                               style={{
//                                 top: linkSuggestionPosition.top,
//                                 left: linkSuggestionPosition.left,
//                               }}
//                             >
//                               {getLinkSuggestions().map((note) => (
//                                 <button
//                                   key={note.id}
//                                   className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0"
//                                   onClick={() => insertLink(note.title)}
//                                 >
//                                   <div className="font-medium">{note.title}</div>
//                                   <div className="text-xs text-muted-foreground truncate">
//                                     {note.content.substring(0, 50)}...
//                                   </div>
//                                 </button>
//                               ))}
//                               {currentLinkQuery &&
//                                 !getLinkSuggestions().some(
//                                   (n) => n.title.toLowerCase() === currentLinkQuery.toLowerCase(),
//                                 ) && (
//                                   <button
//                                     className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-t border-border"
//                                     onClick={() => createNoteFromLink(currentLinkQuery)}
//                                   >
//                                     <div className="flex items-center gap-2">
//                                       <Plus className="h-3 w-3" />
//                                       <span className="font-medium">Create "{currentLinkQuery}"</span>
//                                     </div>
//                                     <div className="text-xs text-muted-foreground">
//                                       Create a new note with this title
//                                     </div>
//                                   </button>
//                                 )}
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         <div className="prose prose-slate max-w-none h-full overflow-y-auto">
//                           <div className="whitespace-pre-wrap text-base leading-relaxed">
//                             {renderContentWithLinks(selectedNote.content)}
//                           </div>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 </div>

//                 {(showLinkedNotes || showBacklinks) && (
//                   <div className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
//                     {showLinkedNotes && (
//                       <div className="mb-6">
//                         <div className="flex items-center gap-2 mb-3">
//                           <Network className="h-4 w-4" />
//                           <h3 className="font-medium">Linked Notes</h3>
//                           <Badge variant="secondary" className="text-xs">
//                             {getLinkedNotes(selectedNote).length}
//                           </Badge>
//                         </div>
//                         <div className="space-y-2">
//                           {getLinkedNotes(selectedNote).map((link) => (
//                             <Card
//                               key={link.id}
//                               className="cursor-pointer hover:bg-accent/50 transition-colors"
//                               onClick={() => {
//                                 const linkedNote = notes.find((n) => n.id === link.id)
//                                 if (linkedNote) {
//                                   setSelectedNote(linkedNote)
//                                   setIsEditing(false)
//                                 }
//                               }}
//                             >
//                               <CardContent className="p-3">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <ExternalLink className="h-3 w-3" />
//                                   <h4 className="font-medium text-sm">{link.title}</h4>
//                                 </div>
//                                 <p className="text-xs text-muted-foreground">{link.preview}</p>
//                               </CardContent>
//                             </Card>
//                           ))}
//                           {getLinkedNotes(selectedNote).length === 0 && (
//                             <p className="text-sm text-muted-foreground">
//                               No linked notes found. Use [[Note Title]] syntax to create links.
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {showBacklinks && (
//                       <div>
//                         <div className="flex items-center gap-2 mb-3">
//                           <ArrowLeft className="h-4 w-4" />
//                           <h3 className="font-medium">Backlinks</h3>
//                           <Badge variant="secondary" className="text-xs">
//                             {getBacklinks(selectedNote).length}
//                           </Badge>
//                         </div>
//                         <div className="space-y-2">
//                           {getBacklinks(selectedNote).map((backlink) => (
//                             <Card
//                               key={backlink.id}
//                               className="cursor-pointer hover:bg-accent/50 transition-colors"
//                               onClick={() => {
//                                 const backlinkNote = notes.find((n) => n.id === backlink.id)
//                                 if (backlinkNote) {
//                                   setSelectedNote(backlinkNote)
//                                   setIsEditing(false)
//                                 }
//                               }}
//                             >
//                               <CardContent className="p-3">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <ArrowLeft className="h-3 w-3" />
//                                   <h4 className="font-medium text-sm">{backlink.title}</h4>
//                                 </div>
//                                 <p className="text-xs text-muted-foreground">{backlink.preview}</p>
//                               </CardContent>
//                             </Card>
//                           ))}
//                           {getBacklinks(selectedNote).length === 0 && (
//                             <p className="text-sm text-muted-foreground">
//                               No backlinks found. Other notes will appear here when they link to this note.
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center">
//               <div className="text-center">
//                 <h2 className="text-xl font-semibold mb-2">Welcome to Notes</h2>
//                 <p className="text-muted-foreground mb-4">Select a note to start reading or create a new one</p>
//                 <Button
//                   onClick={() => {
//                     const newNote: Note = {
//                       id: Date.now().toString(),
//                       title: "Untitled Note",
//                       content: "",
//                       tags: [],
//                       folder: "General",
//                       notebook: "Personal",
//                       backgroundColor: "bg-card",
//                       createdAt: new Date(),
//                       updatedAt: new Date(),
//                       links: [],
//                     }
//                     setNotes((prev) => [newNote, ...prev])
//                     setSelectedNote(newNote)
//                     setIsEditing(true)
//                   }}
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Create Your First Note
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Keyboard Shortcuts Dialog */}
//       <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Keyboard Shortcuts</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <div className="font-medium mb-2">General</div>
//                 <div className="space-y-1">
//                   <div className="flex justify-between">
//                     <span>New Note</span>
//                     <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+N</kbd>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Save Note</span>
//                     <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Search</span>
//                     <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+F</kbd>
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <div className="font-medium mb-2">Editor</div>
//                 <div className="space-y-1">
//                   <div className="flex justify-between">
//                     <span>Toggle Edit</span>
//                     <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+E</kbd>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Exit Edit</span>
//                     <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Help</span>
//                     <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+/</kbd>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }


import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page