// src/app/about/page.tsx
export default function AboutPage() {
  return (
    <section className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-4">聯絡資訊</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>姓名：陳奕安（Ian Chen）</li>
          <li>電話：0966117181</li>
          <li>
            LinkedIn：
            <a
              href="https://www.linkedin.com/in/ian-chen-b8b458140"
              className="underline break-all"
            >
              https://www.linkedin.com/in/ian-chen-b8b458140
            </a>
          </li>
          <li>
            GitHub：
            <a
              href="https://github.com/ianchen9527"
              className="underline break-all"
            >
              https://github.com/ianchen9527
            </a>
          </li>
        </ul>
      </section>

      {/* 技能列表 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">技能</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <li>TypeScript</li>
          <li>React / Next.js</li>
          <li>Vue / Nuxt</li>
          <li>Node.js</li>
          <li>Firebase / Firestore</li>
          <li>Tailwind CSS</li>
          <li>Jest / Vitest</li>
          <li>Git / GitHub</li>
          <li>Figma</li>
        </ul>
      </section>

      {/* 學歷 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">學歷</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <strong>國立臺灣大學</strong> - 資訊工程學系（2006–2011）
          </li>
          <li>
            <strong>台北市立建國中學</strong>（2003–2006）
          </li>
          <li>
            <strong>台北私立薇閣國中 & 國小</strong>（1994–2003）
          </li>
        </ul>
      </section>

      {/* 經歷 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">工作經歷</h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold">
            AmazingTalker｜資深前端工程師 → 技術管理職
          </h3>
          <p className="text-sm text-gray-500">
            2020 – 至今 ｜{" "}
            <a href="https://www.amazingtalker.com" className="underline">
              amazingtalker.com
            </a>
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>主要使用 Vue 與 Nuxt 開發核心系統與前台功能</li>
            <li>
              設計並實作 dataManager 工具 -- 統一封裝
              REST、GraphQL、localStorage、Cookie 資料流
            </li>
            <li>主導樣式系統重構，引入 Tailwind CSS，拔除 Element UI</li>
            <li>建立測試規範與工程準則，提升穩定性與可維護性</li>
            <li>解決技術瓶頸與緊急問題，確保平台穩定</li>
            <li>2022 起擔任技術主管，管理 4–6 人團隊，涵蓋前端或全端</li>
            <li>引入 Mentor 制度，幫助 Junior 快速成長，培養 Senior 領導力</li>
            <li>與主管、創辦人協作推動跨部門需求落地</li>
            <li>團隊擁有公司內最低離職率，展現高度穩定與信任</li>
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold">
            Taroko Software｜資深前端工程師（主要開發者）
          </h3>
          <p className="text-sm text-gray-500">
            2018 – 2020 ｜{" "}
            <a href="https://www.taroko.io" className="underline">
              taroko.io
            </a>
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>主導 Termly 前端開發，撰寫超過 70% 程式碼並擔任 PR reviewer</li>
            <li>
              優化 Webpack 設定，將 hot reload / build 時間從 20 分鐘降至 1
              分鐘內
            </li>
            <li>建立測試與 CI 流程，強化品質與開發信心</li>
            <li>跨部門協作，實作高可維護性的元件架構與響應式 UI</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold">Kono｜前端 / 全端工程師</h3>
          <p className="text-sm text-gray-500">
            2011 – 2018 ｜{" "}
            <a href="https://www.thekono.com" className="underline">
              thekono.com
            </a>
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>從無到有打造 Kono 雜誌閱讀平台</li>
            <li>
              歷經三次全站重構，技術橫跨 jQuery、Backbone、Ember、AngularJS 到
              React
            </li>
            <li>後端採用 PHP (Yii) 與 Ruby on Rails，具備全端背景</li>
            <li>與 PM / 設計密切合作，培養產品思維與對細節的高度敏感度</li>
            <li>撰寫模組化、可測試與可擴充的程式碼，強調長期維護性</li>
          </ul>
        </div>
      </section>
    </section>
  )
}
