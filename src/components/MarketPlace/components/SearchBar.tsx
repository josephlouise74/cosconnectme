import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { SearchBarProps } from '../types'

// Define the search form schema with Zod
const searchFormSchema = z.object({
  searchQuery: z.string()
})

// Infer the type from the schema
type SearchFormValues = z.infer<typeof searchFormSchema>

const SearchBar = ({ search, onFilter, form: parentForm }: SearchBarProps) => {
  // Initialize React Hook Form with Zod validation
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchQuery: search
    }
  })

  // Handle form submission
  const onSubmit = (data: SearchFormValues) => {
    parentForm.setValue('search', data.searchQuery)

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full gap-2">
        <FormField
          control={form.control}
          name="searchQuery"
          render={({ field }) => (
            <FormItem className="flex-1 m-0 w-full">
              <FormControl>
                <div className="relative w-full flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for cosplay items..."
                    className="pl-9 pr-4 flex-1"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      if (e.target.value === '') {
                        parentForm.setValue('search', '')
                      }
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">
          Search
        </Button>
        <Button type="button" variant="outline" size="icon" onClick={onFilter} className="md:hidden">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}

export default SearchBar


