'use client'

import { useState, useRef, useEffect } from 'react'

type User = {
  id: string
  name: string
}

type Platform = {
  id: string
  name: string
  pageName: string
  logoUrl: string | null
  user?: User | null
}

export default function PlatformSelect({ platforms, defaultValue }: { platforms: Platform[], defaultValue?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(defaultValue || '')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [ref])

  const selectedPlatform = platforms.find(p => p.id === selectedId)

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name="platformId" value={selectedId} required />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1 flex items-center justify-between w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-left min-h-[42px]"
      >
        {selectedPlatform ? (
          <div className="flex items-center gap-2">
            {selectedPlatform.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedPlatform.logoUrl} alt="logo" className="w-6 h-6 rounded-md object-cover shadow-sm" />
            ) : (
              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                {selectedPlatform.pageName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-gray-900">{selectedPlatform.name} - {selectedPlatform.pageName}</span>
            {selectedPlatform.user && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-semibold ml-1 shrink-0">
                (ຂອງ: {selectedPlatform.user.name})
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">-- ເລືອກເພຈ --</span>
        )}
        <span className="ml-2 pointer-events-none shrink-0">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
          {platforms.map(platform => (
            <div
              key={platform.id}
              className={`cursor-pointer select-none relative py-2.5 pl-3 pr-9 hover:bg-blue-50 transition-colors ${selectedId === platform.id ? 'bg-blue-100/50' : ''}`}
              onClick={() => {
                setSelectedId(platform.id)
                setIsOpen(false)
              }}
            >
              <div className="flex items-center gap-3">
                {platform.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={platform.logoUrl} alt="logo" className="w-8 h-8 rounded-lg object-cover border border-gray-200 shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 shadow-sm">
                    {platform.pageName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-900 truncate">{platform.name} - {platform.pageName}</span>
                  {platform.user ? (
                    <span className="text-xs text-gray-500 truncate">ຜູ້ຮັບຜິດຊອບ: <span className="font-semibold text-blue-600">{platform.user.name}</span></span>
                  ) : (
                    <span className="text-[11px] text-gray-400">ບໍ່ມີຜູ້ຮັບຜິດຊອບຫຼັກ</span>
                  )}
                </div>
              </div>
              
              {selectedId === platform.id && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          ))}
          {platforms.length === 0 && (
            <div className="py-2 px-3 text-sm text-gray-500">ບໍ່ມີເພຈ/ຊ່ອງໃນລະບົບ</div>
          )}
        </div>
      )}
    </div>
  )
}
