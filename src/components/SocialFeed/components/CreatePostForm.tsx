"use client"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useCreatePost } from '@/lib/api/communityApi'
import { useSupabaseAuth } from '@/lib/hooks/useSupabaseAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Image as LucideImage, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const postFormSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(500, 'Post cannot exceed 500 characters'),
  isForSale: z.boolean().optional().default(false)
})

type PostFormValues = z.infer<typeof postFormSchema>

const MAX_IMAGES = 10

const CreatePostForm = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const router = useRouter()

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema as any),
    defaultValues: {
      content: '',
      isForSale: false
    }
  })


  const { userRolesData, isAuthenticated } = useSupabaseAuth()
  const { createPost, isLoading } = useCreatePost()

  const avatarUrl = userRolesData?.personal_info?.profile_image || '/placeholder-avatar.jpg'
  const avatarFallback = userRolesData?.personal_info?.full_name
    ? userRolesData.personal_info.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U'

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)

    if (uploadedImageUrls.length + fileArray.length > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images`)
      return
    }

    setIsUploading(true)

    try {
      const urls = await Promise.all(
        fileArray.map(file => new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        }))
      )
      setUploadedImageUrls(prev => [...prev, ...urls])
    } catch (error) {
      console.error('Error processing images:', error)
      toast.error('Failed to process images')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (indexToRemove: number) => {
    setUploadedImageUrls(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const onSubmit = async (values: PostFormValues) => {
    console.log('Form submission started with values:', {
      content: values.content,
      isForSale: values.isForSale,
      imageCount: uploadedImageUrls.length
    });

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to signin');
      router.push('/signin');
      toast.warning("Please login first to post");
      return;
    }

    try {
      const prepareData = {
        content: values.content,
        isForSale: values.isForSale,
        images: uploadedImageUrls,
        author: {
          id: userRolesData?.user_id,
          name: userRolesData?.personal_info?.full_name || userRolesData?.username,
          avatar: userRolesData?.personal_info?.profile_image,
          role: userRolesData?.roles?.[0]
        }
      }
      console.log('Creating post with data:', prepareData);



      // In a real implementation, you would call your API here
      await createPost(prepareData);

      // Reset form
      form.reset();
      setUploadedImageUrls([]);
      setIsDialogOpen(false);

      if (onPostCreated) {
        onPostCreated();
      }
      console.log('Form reset and dialog closed');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl px-4 py-3 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition mb-6"
        onClick={() => setIsDialogOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Create a new post"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setIsDialogOpen(true) }}
      >
        <div className="h-10 w-10 relative flex items-center justify-center rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-700">
          <Image
            src={avatarUrl}
            alt="User"
            fill
            className="object-cover"
            onError={(e) => {
              const parent = (e.target as HTMLImageElement).parentElement
              if (parent) {
                parent.innerHTML = `<span class="text-lg font-bold text-gray-600 dark:text-gray-300">${avatarFallback}</span>`
              }
            }}
          />
        </div>
        <div className="flex-1 text-center">
          <span className="text-gray-500 dark:text-gray-400 font-medium">What's new?</span>
        </div>
        <Button
          type="button"
          className="ml-auto px-6"
          disabled={!form.watch('content')?.trim()}
          onClick={e => {
            e.stopPropagation()
            setIsDialogOpen(true)
          }}
        >
          Post
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
            <DialogDescription>
              Share updates, questions, or ideas with the community
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 relative flex items-center justify-center rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-700">
                  <Image
                    src={avatarUrl}
                    alt="User"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const parent = (e.target as HTMLImageElement).parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="text-lg font-bold text-gray-600 dark:text-gray-300">${avatarFallback}</span>`
                      }
                    }}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="What's on your mind?"
                          className="min-h-32 resize-none"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isForSale"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        This post is for selling
                      </FormLabel>
                      <FormDescription>
                        Enable if you're selling something in this post
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {uploadedImageUrls.length > 0 && (
                <div className="w-full">
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 p-1">
                      {uploadedImageUrls.map((url, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <div className="w-24 h-24 relative">
                            <img
                              src={url}
                              alt={`Uploaded ${index + 1}`}
                              className="w-full h-full object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md"
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="text-xs text-muted-foreground mt-1">
                    {uploadedImageUrls.length}/{MAX_IMAGES} images
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <label htmlFor="image-upload" className="sr-only">Upload images</label>
                  <Input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload images"
                    disabled={isUploading || uploadedImageUrls.length >= MAX_IMAGES}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isUploading || uploadedImageUrls.length >= MAX_IMAGES}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LucideImage className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Uploading...' : 'Add Image'}
                  </Button>
                </div>
                <Button
                  type="submit"
                  className='cursor-pointer'
                  disabled={isUploading || isLoading || !form.watch('content')?.trim()}
                >
                  Post
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreatePostForm