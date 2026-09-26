import prisma from '@/lib/prisma'
import Link from 'next/link'
import { toggleAutoTask, deleteAutoTask } from '@/app/actions/auto-tasks'

export default async function AutoTasksPage() {
  const configs = await prisma.dailyTaskConfig.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      platform: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">àº¥àº°àºšàº»àºšàºªà»‰àº²àº‡àº§àº½àºàº­àº±àº”àº•àº°à»‚àº™àº¡àº±àº” (Auto-Tasks)</h1>
          <p className="text-sm text-gray-500 mt-1">àº§àº½àºà»ƒàº™à»œà»‰àº²àº™àºµà»‰àºˆàº°àº–àº·àºàºªà»‰àº²àº‡àº‚àº¶à»‰àº™à»ƒà»à»ˆàº—àº¸àºà»†àº¡àº·à»‰àº­àº±àº”àº•àº°à»‚àº™àº¡àº±àº”</p>
        </div>
        <div className="flex space-x-2">
          <Link 
            href="/api/cron/generate-tasks" 
            target="_blank"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            Run Cron àº”àº½àº§àº™àºµà»‰
          </Link>
          <Link 
            href="/admin/auto-tasks/new" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + à»€àºžàºµà»ˆàº¡àº§àº½àºàº›àº°àºˆàº³
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {configs.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              àºàº±àº‡àºšà»à»ˆàº¡àºµàºàº²àº™àº•àº±à»‰àº‡àº„à»ˆàº²àº§àº½àºàº›àº°àºˆàº³
            </li>
          ) : (
            configs.map((config) => (
              <li key={config.id}>
                <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 truncate">{config.title}</h3>
                    <div className="mt-1 flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500">
                      <span>àºžàº°àº™àº±àºàº‡àº²àº™: {config.user.name}</span>
                      <span className="hidden sm:inline">&middot;</span>
                      <span>à»€àºžàºˆ: {config.platform.name}</span>
                      <span className="hidden sm:inline">&middot;</span>
                      <span className="font-semibold text-red-500">à»€àº§àº¥àº² (Deadline): {config.timeOfDay}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {config.isActive ? 'à»€àº›àºµàº”à»ƒàºŠà»‰àº‡àº²àº™' : 'àº›àº´àº”à»ƒàºŠà»‰àº‡àº²àº™'}
                    </span>
                                        <form action={async () => {
                      'use server'
                      await toggleAutoTask(config.id, config.isActive)
                    }}>
                      <button type="submit" className="text-sm text-blue-600 hover:underline">
                        {config.isActive ? 'ປິດ' : 'ເປີດ'}
                      </button>
                    </form>
                    <Link href={`/admin/auto-tasks/edit/${config.id}`} className="text-sm text-orange-500 hover:underline">ແກ້ໄຂ</Link>
                    <form action={async () => {
                      'use server'
                      await deleteAutoTask(config.id)
                    }}>
                      <button type="submit" className="text-sm text-red-600 hover:underline">ລຶບ</button>
                    </form>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

