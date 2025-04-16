import zh from "@/locales/zh"
import en from "@/locales/en"

type Dictionary = typeof zh
type DictionaryKey = keyof Dictionary

export async function getTranslations<K extends DictionaryKey>(
  params: Promise<{ locale: string }>,
  key: K
): Promise<Dictionary[K]>
export async function getTranslations(
  params: Promise<{ locale: string }>
): Promise<Dictionary>

export async function getTranslations(
  params: Promise<{ locale: string }>,
  key?: DictionaryKey
): Promise<Dictionary[keyof Dictionary] | Dictionary> {
  const { locale } = await params
  const dict = locale === "zh" ? zh : en

  return key ? dict[key] : dict
}
