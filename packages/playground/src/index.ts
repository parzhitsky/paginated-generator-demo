import { PaginatedGenerator } from './paginated-generator/paginated-generator.js'
import { PaginatedGeneratorDemo } from './paginated-generator-demo/paginated-generator-demo.js'

const generator = new PaginatedGenerator('lorem ipsum dolor sit amet consectetur…')
const demo = new PaginatedGeneratorDemo(generator, { pageSize: 3 })

demo.start()
