import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ categorySlug: string }>
}

export default async function CategoryPageEN({ params }: Props) {
  const { categorySlug } = await params
  redirect(`/en/search?category=${categorySlug}`)
}
