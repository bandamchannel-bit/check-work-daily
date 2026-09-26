import prisma from '@/lib/prisma'
import Link from 'next/link'
import DeleteButton from './DeleteButton'
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

// SVG Icons for popular platforms
const PlatformIcons = {
  Facebook: (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  ),
  TikTok: (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  ),
  YouTube: (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M21.582 6.186a2.686 2.686 0 00-1.884-1.895C17.986 3.833 12 3.833 12 3.833s-5.986 0-7.698.458A2.686 2.686 0 002.418 6.186C1.96 7.9 1.96 12 1.96 12s0 4.1.458 5.814a2.686 2.686 0 001.884 1.895C6.014 20.167 12 20.167 12 20.167s5.986 0 7.698-.458a2.686 2.686 0 001.884-1.895c.458-1.714.458-5.814.458-5.814s0-4.1-.458-5.814zM9.96 15.556V8.444L16.03 12l-6.07 3.556z" clipRule="evenodd" />
    </svg>
  ),
  Instagram: (
    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.46 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
    </svg>
  ),
  Other: (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

export default async function EmployeePlatformsPage() {
  const session = await getSession()
  if (!session) redirect('/')

  const platforms = await prisma.platform.findMany({
    where: session.userRole === 'ADMIN' 
      ? {} 
      : {
          OR: [
            { userId: session.userId },
            { userId: null }
          ]
        },
    orderBy: { createdAt: 'desc' }
  })

  // Determine logo color & icon based on name
  const getLogoConfig = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('facebook')) return { bg: 'bg-[#1877F2] shadow-blue-500/30', icon: PlatformIcons.Facebook }
    if (n.includes('youtube')) return { bg: 'bg-[#FF0000] shadow-red-500/30', icon: PlatformIcons.YouTube }
    if (n.includes('tiktok')) return { bg: 'bg-black shadow-gray-500/30', icon: PlatformIcons.TikTok }
    if (n.includes('instagram')) return { bg: 'bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] shadow-pink-500/30', icon: PlatformIcons.Instagram }
    return { bg: 'bg-gray-400 shadow-gray-400/30', icon: PlatformIcons.Other }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ເພຈ / ຊ່ອງ ຂອງຂ້ອຍ</h1>
          <p className="mt-1 text-sm text-gray-500">ເພີ່ມ ແລະ ຈັດການຊ່ອງທາງ Social Media ຂອງທ່ານເອງ</p>
        </div>
        <Link href="/employee/platforms/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          ເພີ່ມເພຈໃໝ່
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          const { bg, icon } = getLogoConfig(platform.name)
          return (
            <div key={platform.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/40 transition-all hover:-translate-y-1 group">
              <div className="p-6 flex flex-col items-center text-center relative">
                {/* Decorative background shape */}
                <div className={`absolute top-0 w-full h-24 opacity-10 ${bg.split(' ')[0]}`} />
                
                {platform.logoUrl ? (
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg relative z-10 mb-4 overflow-hidden bg-white transform group-hover:scale-105 transition-transform">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={platform.logoUrl} alt={platform.pageName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative z-10 mb-4 ${bg} transform group-hover:scale-110 transition-transform`}>
                    {icon}
                  </div>
                )}
                
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 w-full">{platform.pageName}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mt-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${bg.split(' ')[0]}`}></span>
                  {platform.name}
                </span>
                
                {platform.url && (
                  <a href={platform.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-4 bg-blue-50 px-3 py-1.5 rounded-lg inline-block w-full truncate transition-colors">
                    {platform.url}
                  </a>
                )}
              </div>
              <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex justify-between items-center gap-3">
                <span className="text-xs text-gray-500">ເພີ່ມເມື່ອ: {new Date(platform.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Link href={`/employee/platforms/${platform.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ແກ້ໄຂ">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </Link>
                  <DeleteButton id={platform.id} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
