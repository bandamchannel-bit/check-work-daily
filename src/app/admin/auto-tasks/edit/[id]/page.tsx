import { updateAutoTask } from '@/app/actions/auto-tasks'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EditAutoTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  const users = await prisma.user.findMany({ where: { role: 'USER' } })
  const platforms = await prisma.platform.findMany()

  const config = await prisma.dailyTaskConfig.findUnique({
    where: { id }
  })

  if (!config) {
    redirect('/admin/auto-tasks')
  }

  const selectedDays = config.daysOfWeek.split(',')

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">ແກ້ໄຂ ວຽກອັດຕະໂນມັດ</h1>
        <Link href="/admin/auto-tasks" className="text-blue-600 hover:underline">
          ກັບຄືນ
        </Link>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 max-w-2xl">
        <form action={async (formData: FormData) => {
          'use server'
          await updateAutoTask(formData)
        }} className="space-y-6">
          <input type="hidden" name="id" value={config.id} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700">ຫົວຂໍ້ໜ້າວຽກ (Task Title)</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={config.title}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ຕົວຢ່າງ: ອັບໂຫຼດວີດີໂອໃໝ່"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ຜູ້ຮັບຜິດຊອບ (Employee)</label>
            <select
              name="userId"
              required
              defaultValue={config.userId}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- ເລືອກພະນັກງານ --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ເພຈ/ຊ່ອງທາງ (Platform)</label>
            <select
              name="platformId"
              required
              defaultValue={config.platformId}
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- ເລືອກເພຈ --</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name} - {platform.pageName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ກຳນົດເວລາສົ່ງ (Time of Day - 24hr format)</label>
            <input
              type="time"
              name="timeOfDay"
              required
              defaultValue={config.timeOfDay}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">ນີ້ຄື Deadline ຂອງແຕ່ລະວັນ</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ມື້ທີ່ຕ້ອງການໃຫ້ສ້າງ (Days of the week)</label>
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
                    defaultChecked={selectedDays.includes(day.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ບັນທຶກການປ່ຽນແປງ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
