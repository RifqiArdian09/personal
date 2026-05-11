<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits(['update:modelValue', 'update:json'])

const lowlight = createLowlight(common)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
    }),
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-full'
      }
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-teal-600 dark:text-teal-400 underline decoration-teal-500/30'
      }
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight.configure({
      HTMLAttributes: {
        class: 'bg-teal-100 dark:bg-teal-900/30 text-black dark:text-white px-1 rounded'
      }
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Start typing something amazing...',
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
    emit('update:json', editor.getJSON())
  },
})

// Update content if modelValue changes externally
watch(() => props.modelValue, (value) => {
  const currentHTML = editor.value?.getHTML()
  if (editor.value && currentHTML !== value) {
    editor.value.commands.setContent(value, { emitUpdate: false })
  }
})

const setLink = () => {
  const url = window.prompt('URL')
  if (url && editor.value) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

const supabase = useSupabaseClient()
const toast = useToast()

const addImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('projects')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('projects')
        .getPublicUrl(fileName)

      editor.value?.chain().focus().setImage({ src: data.publicUrl }).run()
      toast.add({ title: 'Image inserted', color: 'success', icon: 'i-heroicons-photo' })
    } catch (err: any) {
      toast.add({ title: 'Upload failed', description: err.message, color: 'error', icon: 'i-heroicons-x-circle' })
    }
  }
  input.click()
}
</script>

<template>
  <div v-if="editor" class="tiptap-container flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0f172a] transition-all focus-within:ring-2 focus-within:ring-teal-500/20">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 p-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
      <div class="flex items-center gap-1 mr-2 px-1">
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-bold"
          :class="{ 'bg-slate-200 dark:bg-slate-800 text-teal-600': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
        />
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-italic"
          :class="{ 'bg-slate-200 dark:bg-slate-800 text-teal-600': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
        />
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-underline"
          :class="{ 'bg-slate-200 dark:bg-slate-800 text-teal-600': editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()"
        />
      </div>

      <USeparator orientation="vertical" class="h-6 mx-1" />

      <div class="flex items-center gap-1 mx-2">
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          :class="{ 'bg-slate-200 dark:bg-slate-800 text-teal-600': editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >H1</UButton>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          :class="{ 'bg-slate-200 dark:bg-slate-800 text-teal-600': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >H2</UButton>
      </div>

      <USeparator orientation="vertical" class="h-6 mx-1" />

      <div class="flex items-center gap-1 mx-2">
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-list-bullet"
          :class="{ 'bg-slate-200 dark:bg-slate-800 text-teal-600': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
        />
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-bars-3-bottom-left"
          @click="editor.chain().focus().setTextAlign('left').run()"
        />
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-bars-3"
          @click="editor.chain().focus().setTextAlign('center').run()"
        />
      </div>

      <div class="ms-auto flex items-center gap-1">
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-link"
          :class="{ 'bg-slate-200 dark:bg-slate-800 text-teal-600': editor.isActive('link') }"
          @click="setLink"
        />
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-photo"
          @click="addImage"
        />
      </div>
    </div>
    
    <!-- Editor -->
    <div class="p-6 prose dark:prose-invert max-w-none min-h-[350px] overflow-y-auto">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<style>
.ProseMirror:focus {
  outline: none;
}
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #64748b;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
.tiptap-container .ProseMirror {
  min-height: 350px;
}
</style>
