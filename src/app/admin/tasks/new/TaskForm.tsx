'use client'

import { useState } from 'react'

export default function TaskForm({
  users,
  platforms,
  defaultPlatformId,
  createTaskAction,
  createAutoTaskAction
}: {
  users: any[]
  platforms: any[]
  defaultPlatformId?: string
  createTaskAction: (formData: FormData) => void
  createAutoTaskAction: (formData: FormData) => void
}) {
  const [taskType, setTaskType] = useState<'ONCE' | 'RECURRING'>('ONCE')

  // Array of days for checkboxes
  const days = [
    { value: '1', label: 'ຈັນ' },
    { value: '2', label: 'ອັງຄານ' },
    { value: '3', label: 'ພຸດ' },
    { value: '4', label: 'ພະຫັດ' },
    { value: '5', label: 'ສຸກ' },
    { value: '6', label: 'ເສົາ' },
    { value: '0', label: 'ອາທິດ' }
  ]

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 max-w-2xl">
      {/* Tabs for Task Type */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setTaskType('ONCE')}
          className={`pb-2 px-2 text-sm font-semibold transition-colors ${
            taskType === 'ONCE' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ມອບວຽກຄັ້ງດຽວ (One-time)
        </button>
        <button
          type="button"
          onClick={() => setTaskType('RECURRING')}
          className={`pb-2 px-2 text-sm font-semibold transition-colors ${
            taskType === 'RECURRING' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ມອບວຽກປະຈຳ (ອັດຕະໂນມັດ)
        </button>
      </div>

      <form action={taskType === 'ONCE' ? createTaskAction : createAutoTaskAction} className="space-y-6">
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">ມອບໃຫ້ (Employee)</label>
            <select
              name="userId"
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- ເລືອກພະນັກງານ --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ເພຈ/ຊ່ອງ (Platform)</label>
            <select
              name="platformId"
              defaultValue={defaultPlatformId || ''}
              required
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- ເລືອກເພຈ --</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>{platform.name} - {platform.pageName}</option>
              ))}
            </select>
          </div>
        </div>

        {taskType === 'ONCE' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ກຳນົດເວລາ (Deadline)</label>
            <div className="flex gap-4">
              <input
                type="date"
                name="date"
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="time"
                name="time"
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">ເລືອກມື້ ແລະ ເວລາທີ່ຕ້ອງການໃຫ້ພະນັກງານເຮັດສຳເລັດ.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ເວລາທີ່ຕ້ອງເຮັດທຸກມື້ (Time of Day)</label>
              <input
                type="time"
                name="timeOfDay"
                required
                className="block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ມື້ທີ່ຕ້ອງເຮັດ (Days of the week)</label>
              <div className="flex flex-wrap gap-3">
                {days.map((day) => (
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
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transition-all"
          >
            {taskType === 'ONCE' ? 'ບັນທຶກ ແລະ ມອບໝາຍວຽກ' : 'ສ້າງວຽກອັດຕະໂນມັດ'}
          </button>
        </div>
      </form>
    </div>
  )
}
