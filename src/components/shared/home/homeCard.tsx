import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
  }[]
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-4">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className="group relative overflow-hidden rounded-lg border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950 hover:border-gray-300 dark:hover:border-gray-700"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:from-blue-900 dark:to-indigo-900"></div>
          
          <CardContent className="p-6 flex-1">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">{card.title}</h3>
            <div className="grid grid-cols-2 gap-6">
              {card.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center group/item transition-transform duration-200 hover:translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2"
                >
                  <div className="relative mb-3 overflow-hidden rounded-md bg-gray-100 p-2 dark:bg-gray-800 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="aspect-square object-contain max-w-full h-auto transition-transform duration-300 group-hover/item:scale-110"
                      height={120}
                      width={120}
                    />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-full group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-200">
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          {card.link && (
            <CardFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <Link 
                href={card.link.href} 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center transition-colors duration-200"
              >
                <span>{card.link.text}</span>
                <svg className="w-4 h-4 ml-1 transform transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}