import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { APP_NAME } from '@/lib/constants'

const categories = ['men', 'women', 'kids', 'accessories']

export default function Search() {
  return (
    <form
      action="/search"
      method="GET"
      className="flex items-stretch h-12 w-full max-w-2xl group"
    >
      {/* Category Select */}
      <Select name="category">
        <SelectTrigger className=" w-auto h-full px-4 bg-gray-800 border border-gray-700 rounded-l-full text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 group-hover:border-indigo-400">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 text-white border-gray-700">
          <SelectItem value="all" className="hover:bg-indigo-600 hover:text-white">
            All
          </SelectItem>
          {categories.map((category) => (
            <SelectItem
              key={category}
              value={category}
              className="capitalize hover:bg-indigo-600 hover:text-white"
            >
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search Input */}
      <Input
        className="flex-1 h-full rounded-none bg-gray-800 border-y border-gray-700 text-white placeholder-gray-400 focus:ring-0 focus:border-indigo-500 transition-all duration-300 group-hover:border-indigo-400"
        placeholder={`Search on ${APP_NAME}...`}
        name="q"
        type="search"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="h-full px-4 bg-indigo-600 text-white rounded-r-full hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
      >
        <SearchIcon className="w-6 h-6" />
      </button>
    </form>
  )
}