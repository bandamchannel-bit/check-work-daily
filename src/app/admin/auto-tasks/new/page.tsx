import { createAutoTask } from '@/app/actions/auto-tasks'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function NewAutoTaskPage() {
  const users = await prisma.user.findMany({ where: { role: 'USER' } })
  const platforms = await prisma.platform.findMany()

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">ເພີ່ມວຽກປະຈຳ (Auto-Task)</h1>
        <Link href="/admin/auto-tasks" className="text-blue-600 hover:underline">
          ກັບຄືນ
        </Link>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 max-w-2xl">
        <form action={createAutoTask} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">ຫົວຂໍ້ວຽກ (Task Title)</label>
            <input
              type="text"
              name="title"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ເຊັ່ນ: ລົງຄລິບ TikTok ຕອນເຊົ້າ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ມອບໃຫ້ (Employee)</label>
            <select
              name="userId"
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- ເລືອກພະນັກງານ --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ເພຈ/ຊ່ອງ (Platform)</label>
            <select
              name="platformId"
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- ເລືອກເພຈ --</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name} - {platform.pageName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ເວລາໃນແຕ່ລະມື້ (Time of Day - 24hr format)</label>
            <input
              type="time"
              name="timeOfDay"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">ນີ້ຄືເວລາ Deadline ຂອງແຕ່ລະມື້</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ມື້ທີ່ຕ້ອງເຮັດ (Days of the week)</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: '1', label: 'ຈັນ' },
                { value: '2', label: 'ອັງຄານ' },
                { value: '3', label: 'ພຸດ' },
                { value: '4', label: 'ພະຫັດ' },
                { value: '5', label: 'ສຸກ' },
                { value: '6', label: 'ເສົາ' },
                { value: '0', label: 'ອາທິດ' }
              ].map((day) => (
                <label key={day.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="daysOfWeek"
                    value={day.value}
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">ຕິກເລືອກມື້ທີ່ຕ້ອງການໃຫ້ລະບົບສ້າງວຽກນີ້ຂຶ້ນມາອັດຕະໂນມັດ.</p>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ບັນທຶກການຕັ້ງຄ່າ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
