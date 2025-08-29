'use client'

export default function TestContainer() {
  return (
    <div 
      className="bg-red-500 flex items-center justify-center"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="text-white text-4xl font-bold text-center">
        🔴 CONTAINER TEST<br/>
        Should Fill Entire Screen<br/>
        Width: 100% Height: 100%
      </div>
    </div>
  )
}