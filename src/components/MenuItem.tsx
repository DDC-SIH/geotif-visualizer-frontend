import React from 'react'

export default function MenuItem({
    children,
    name,
}: {
    children?: React.ReactNode,
    name: string,
}) {
    return (
        <div className="flex flex-col gap-1 min-w-full px-4">
            <div className="text-lg font-semibold">{name}</div>
            {children}
        </div>
    )
}
