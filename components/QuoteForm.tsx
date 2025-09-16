import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from './ui/textarea';
import AuthorSelect from './AuthorSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import TagSelect from './TagSelect';
import { Button } from './ui/button';
import { formSchema } from '@/lib/schemas/quote';

type FormValues = z.infer<typeof formSchema>;

interface QuoteFormProps {
  mode: 'create' | 'edit';
  defaultValues: FormValues;
  onSubmit: (values: FormValues) => void;
  submitting?: boolean;
}

const QuoteForm = ({
  mode,
  defaultValues,
  onSubmit,
  submitting,
}: QuoteFormProps) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const sourceType = form.watch('source.type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='text'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Text</FormLabel>
              <FormControl>
                <Textarea placeholder='Enter the quote' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='author'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <AuthorSelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='source.type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source Type</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select source type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='YOUTUBE'>Youtube</SelectItem>
                    <SelectItem value='BOOK'>Book</SelectItem>
                    <SelectItem value='ARTICLE'>Article</SelectItem>
                    <SelectItem value='PODCAST'>Podcast</SelectItem>
                    <SelectItem value='SPEECH'>Speech</SelectItem>
                    <SelectItem value='INTERVIEW'>Interview</SelectItem>
                    <SelectItem value='WEBSITE'>Website</SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {sourceType && (
          <>
            <FormField
              control={form.control}
              name='source.title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Title</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the source title' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='source.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the source URL' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {sourceType === 'YOUTUBE' && (
          <>
            <FormField
              control={form.control}
              name='source.channel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Channel</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the YouTube cnannel' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='source.timestamp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timestamp</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter the timestamp' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagSelect value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end items-center'>
          <Button disabled={submitting} type='submit'>
            {submitting
              ? mode === 'create'
                ? 'Saving...'
                : 'Updating...'
              : mode === 'create'
              ? 'Save Quote'
              : 'Update Quote'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuoteForm;
