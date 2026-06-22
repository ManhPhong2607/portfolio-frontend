// // components/admin/media-picker-dialog.tsx

import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/adminService'
import { Upload, Check, ImageIcon } from 'lucide-react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { MediaFileDto } from '@/types/api'
import Image from 'next/image'
import { Avatar } from '@radix-ui/react-avatar'

const FOLDERS = [
    { value: 'all', label: 'All' },
    { value: 'avatar', label: 'Avatar' },
    { value: 'blog', label: 'Blog' },
    { value: 'cv', label: 'CV' },
    { value: 'projects', label: 'Projects' },
    { value: 'general', label: 'General' },
]

interface Props {
    open: boolean
    onClose: () => void
    onSelect: (media: MediaFileDto) => void
    defaultFolder?: string
    resourceType?: 'image' | 'raw'
   
}

export function MediaPickerDialog({ open, onClose, onSelect, defaultFolder = 'all', resourceType = 'image' }: Props) {
    const qc = useQueryClient()
    const fileRef = useRef<HTMLInputElement>(null)

    const [folder, setFolder] = useState(defaultFolder)
    const [selected, setSelected] = useState<MediaFileDto | null>(null)
    const [uploading, setUploading] = useState(false)

    const { data: files = [], isLoading } = useQuery({
        queryKey: ['admin-media', folder],
        queryFn: () => adminService.getMediaFiles(folder === 'all' ? undefined : folder),
        enabled: open,
    })

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const uploadFolder = folder === 'all' ? 'general' : folder
            const result = await adminService.uploadMedia(file, uploadFolder)
            qc.invalidateQueries({ queryKey: ['admin-media'] })
            setSelected(result)
            toast.success('Uploaded!')
        } catch {
            toast.error('Upload failed.')
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    const handleConfirm = () => {
        if (selected) {
            onSelect(selected)
            setSelected(null)
            onClose()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select Image</DialogTitle>
                </DialogHeader>

                {/* Toolbar */}
                <div className="flex items-center gap-3 border-b border-border pb-3">
                    {defaultFolder !== 'cv' && (  // để cho replace cv
                    <Select value={folder} onValueChange={setFolder}>
                        <SelectTrigger className="w-36">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FOLDERS.map(f => (
                                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    )}

                    <input
                        ref={fileRef}
                        type="file"
                        accept={resourceType === 'raw' ? "application/*" : "image/jpeg,image/png,image/webp,image/gif"}
                        className="hidden"
                        onChange={handleUpload}
                    />
                    <Button
                        variant="outline" size="sm"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload size={14} className="mr-2" />
                        {uploading ? 'Uploading...' : 'Upload New'}
                    </Button>

                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                        <Button size="sm" disabled={!selected} onClick={handleConfirm}>
                            <Check size={14} className="mr-2" />
                            Select
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="grid grid-cols-4 gap-2 p-1">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : files.filter(f => f.resourceType === resourceType).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <ImageIcon size={40} className="text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                No {resourceType}s yet.{' '}
                                <button
                                    className="text-accent underline"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    Upload one
                                </button>
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-2 p-1">
                            {files
                                .filter(f => f.resourceType === resourceType)
                                .map(file => (
                                    <button
                                        key={file.id}
                                        onClick={() => setSelected(file)}
                                        className={cn(
                                            'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                                            selected?.id === file.id
                                                ? 'border-accent ring-2 ring-accent ring-offset-1'
                                                : 'border-transparent hover:border-border'
                                        )}
                                    >
                                        {file.resourceType === 'image' ? (
                                            <Image
                                                src={file.secureUrl}
                                                alt={file.originalFilename ?? ''}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary">
                                                <ImageIcon size={32} className="text-muted-foreground mb-2" />
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    PDF
                                                </span>
                                                <span className="mt-1 px-2 text-[10px] text-center text-muted-foreground line-clamp-2">
                                                    {file.originalFilename}
                                                </span>
                                            </div>
                                        )}
                                        {selected?.id === file.id && (
                                            <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                                <div className="bg-accent text-accent-foreground rounded-full p-1">
                                                    <Check size={14} />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// 'use client'

// import { useRef, useState } from 'react'
// import { useQuery, useQueryClient } from '@tanstack/react-query'
// import { adminService } from '@/services/adminService'
// import { Upload, Check, ImageIcon } from 'lucide-react'
// import {
//     Dialog, DialogContent, DialogHeader, DialogTitle,
// } from '@/components/ui/dialog'
// import {
//     Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select'
// import { Button } from '@/components/ui/button'
// import { cn } from '@/lib/utils'
// import { toast } from 'sonner'
// import type { MediaFileDto } from '@/types/api'
// import Image from 'next/image'

// const FOLDERS = [
//     { value: 'all', label: 'All' },
//     { value: 'avatar', label: 'Avatar'},
//     { value: 'blog', label: 'Blog' },
//     { value: 'projects', label: 'Projects' },
//     { value: 'general', label: 'General' },
// ]

// interface Props {
//     open: boolean
//     onClose: () => void
//     onSelect: (media: MediaFileDto) => void
//     defaultFolder?: string
//     resourceType?: 'image' | 'raw'
// }

// export function MediaPickerDialog({ open, onClose, onSelect, defaultFolder = 'all', resourceType = 'image' }: Props) {
//     const qc = useQueryClient()
//     const fileRef = useRef<HTMLInputElement>(null)

//     const [folder, setFolder] = useState(defaultFolder)
//     const [selected, setSelected] = useState<MediaFileDto | null>(null)
//     const [uploading, setUploading] = useState(false)

//     const { data: files = [], isLoading } = useQuery({
//         queryKey: ['admin-media', folder],
//         queryFn: () => adminService.getMediaFiles(folder === 'all' ? undefined : folder),
//         enabled: open,
//     })

//     const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0]
//         if (!file) return
//         setUploading(true)
//         try {
//             const uploadFolder = folder === 'all' ? 'general' : folder
//             const result = await adminService.uploadMedia(file, uploadFolder)
//             qc.invalidateQueries({ queryKey: ['admin-media'] })
//             setSelected(result)
//             toast.success('Uploaded!')
//         } catch {
//             toast.error('Upload failed.')
//         } finally {
//             setUploading(false)
//             if (fileRef.current) fileRef.current.value = ''
//         }
//     }

//     const handleConfirm = () => {
//         if (selected) {
//             onSelect(selected)
//             setSelected(null)
//             onClose()
//         }
//     }

//     return (
//         <Dialog open={open} onOpenChange={onClose}>
//             <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
//                 <DialogHeader>
//                     <DialogTitle>Select Image</DialogTitle>
//                 </DialogHeader>

//                 {/* Toolbar */}
//                 <div className="flex items-center gap-3 border-b border-border pb-3">
//                     <Select value={folder} onValueChange={setFolder}>
//                         <SelectTrigger className="w-36">
//                             <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {FOLDERS.map(f => (
//                                 <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>

//                     <input
//                         ref={fileRef}
//                         type="file"
//                         accept={resourceType === 'raw' ? 'application/pdf'
//                             : 'image/jpeg,image/png,image/webp,image/gif'}
//                         className="hidden"
//                         onChange={handleUpload}
//                     />
//                     <Button
//                         variant="outline" size="sm"
//                         onClick={() => fileRef.current?.click()}
//                         disabled={uploading}
//                     >
//                         <Upload size={14} className="mr-2" />
//                         {uploading ? 'Uploading...' : 'Upload New'}
//                     </Button>

//                     <div className="ml-auto flex items-center gap-2">
//                         <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
//                         <Button size="sm" disabled={!selected} onClick={handleConfirm}>
//                             <Check size={14} className="mr-2" />
//                             Select
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Grid */}
//                 <div className="flex-1 overflow-y-auto">
//                     {isLoading ? (
//                         <div className="grid grid-cols-4 gap-2 p-1">
//                             {[...Array(8)].map((_, i) => (
//                                 <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
//                             ))}
//                         </div>
//                     ) : files.filter(f => f.resourceType === resourceType).length === 0 ? (
//                         <div className="flex flex-col items-center justify-center py-16 gap-3">
//                             <ImageIcon size={40} className="text-muted-foreground" />
//                             <p className="text-sm text-muted-foreground">
//                                 No {resourceType === 'raw' ? 'PDF files' : 'images'} yet.
//                                 {' '}
//                                 <button
//                                     className="text-accent underline"
//                                     onClick={() => fileRef.current?.click()}
//                                 >
//                                     Upload one
//                                 </button>
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-4 gap-2 p-1">
//                             {files
//                                 .filter(f => f.resourceType === resourceType)
//                                 .map(file => (
//                                     <button
//                                         key={file.id}
//                                         onClick={() => setSelected(file)}
//                                         className={cn(
//                                             'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
//                                             selected?.id === file.id
//                                                 ? 'border-accent ring-2 ring-accent ring-offset-1'
//                                                 : 'border-transparent hover:border-border'
//                                         )}
//                                     >
//                                         {file.resourceType === 'image' ? (
//                                             <Image
//                                                 src={file.secureUrl}
//                                                 alt={file.originalFilename ?? ''}
//                                                 fill
//                                                 className="object-cover"
//                                             />
//                                         ) : (
//                                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary">
//                                                 <ImageIcon size={32} className="text-muted-foreground mb-2" />
//                                                 <span className="text-xs font-medium text-muted-foreground">
//                                                     PDF
//                                                 </span>
//                                                 <span className="mt-1 px-2 text-[10px] text-center text-muted-foreground line-clamp-2">
//                                                     {file.originalFilename}
//                                                 </span>
//                                             </div>
//                                         )}
//                                         {selected?.id === file.id && (
//                                             <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
//                                                 <div className="bg-accent text-accent-foreground rounded-full p-1">
//                                                     <Check size={14} />
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </button>
//                                 ))}
//                         </div>
//                     )}
//                 </div>
//             </DialogContent>
//         </Dialog>
//     )
// }