/**
 * 翻译文件生成器
 */
import { escapeUnicodeForJSON } from '~/utils/unicode'

export type TranslationFiles = Record<string, Record<string, string>>

export class TranslationGenerator {
  /**
   * 生成翻译文件
   */
  generate(
    translations: TranslationFiles,
    namespace: string = 'minecraft',
  ): Array<{ locale: string, path: string, content: string }> {
    const results: Array<{ locale: string, path: string, content: string }> = []

    for (const [locale, data] of Object.entries(translations)) {
      if (Object.keys(data).length > 0) {
        const langPath = `assets/${namespace}/lang/${locale}.json`
        const translationContent = escapeUnicodeForJSON(JSON.stringify(data, null, 2))

        results.push({
          locale,
          path: langPath,
          content: translationContent,
        })
      }
    }

    return results
  }
}
