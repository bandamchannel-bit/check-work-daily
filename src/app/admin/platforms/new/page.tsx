import { createPlatform } from '@/app/actions/platforms'
import Link from 'next/link'

export default function NewPlatformPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ເພີ່ມເພຈ / ຊ່ອງໃໝ່</h1>
          <p className="mt-2 text-gray-600">ພຽງແຕ່ວາງ Link, ລະບົບຈະກວດສອບປະເພດ (Facebook, TikTok...) ໃຫ້ອັດຕະໂນມັດ</p>
        </div>
        <Link href="/admin/platforms" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-medium">
          ຍົກເລີກ
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-8">
        <form action={createPlatform} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ຊື່ເພຈ / ຊື່ຊ່ອງ (Page Name)</label>
            <input
              type="text"
              name="pageName"
              required
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
              placeholder="ເຊັ່ນ: ຮ້ານຂາຍເຄື່ອງ ABC, ຊ່ອງເລົ່າເລື່ອງ..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ລິ້ງ (URL)</label>
            <input
              type="url"
              name="url"
              required
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
              placeholder="ເຊັ່ນ: https://www.facebook.com/my-page"
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ລະບົບຈະກວດສອບປະເພດ (Facebook, TikTok...) ຈາກ Link ນີ້ອັດຕະໂນມັດ
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ອັບໂຫຼດຮູບໂປຣໄຟລ໌ (Profile Picture) - ທາງເລືອກ</label>
            <input
              type="file"
              name="logoImage"
              accept="image/*"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500">ເລືອກຮູບໂປຣໄຟລ໌ຂອງເພຈໃນເຄື່ອງຂອງທ່ານ. (ຖ້າບໍ່ໃສ່ ຈະໃຊ້ໄອຄອນມາດຕະຖານ)</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-lg shadow-blue-600/20"
            >
              ບັນທຶກເພຈໃໝ່
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
