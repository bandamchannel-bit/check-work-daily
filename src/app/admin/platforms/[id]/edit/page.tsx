import { updatePlatform } from '@/app/actions/platforms'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditPlatformPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const platform = await prisma.platform.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!platform) {
    notFound()
  }

  // Need to bind the platform id to the server action
  const updatePlatformWithId = updatePlatform.bind(null, platform.id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ແກ້ໄຂເພຈ / ຊ່ອງ</h1>
          <p className="mt-2 text-gray-600">ແກ້ໄຂຂໍ້ມູນຂອງ {platform.pageName}</p>
        </div>
        <Link href="/admin/platforms" className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-medium">
          ຍົກເລີກ
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-8">
        <form action={async (formData: FormData) => {
          'use server'
          await updatePlatformWithId(formData)
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ຊື່ເພຈ / ຊື່ຊ່ອງ (Page Name)</label>
            <input
              type="text"
              name="pageName"
              defaultValue={platform.pageName}
              required
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ລິ້ງ (URL)</label>
            <input
              type="url"
              name="url"
              defaultValue={platform.url || ''}
              required
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">ອັບໂຫຼດຮູບໂປຣໄຟລ໌ (Profile Picture) ໃໝ່ - ທາງເລືອກ</label>
            {platform.logoUrl && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">ຮູບປັດຈຸບັນ:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={platform.logoUrl} alt="Current logo" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
              </div>
            )}
            <input
              type="file"
              name="logoImage"
              accept="image/*"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500">ຖ້າບໍ່ຕ້ອງການປ່ຽນຮູບໃໝ່ ໃຫ້ປະຫວ່າງໄວ້.</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-lg shadow-blue-600/20"
            >
              ບັນທຶກການປ່ຽນແປງ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
