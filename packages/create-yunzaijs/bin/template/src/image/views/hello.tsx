import React from 'react'
import { BackgroundImage, createRequire } from 'react-puppeteer'
import Nav from '@/image/component/Nav.tsx'
import NavItem from '@/image/component/NavItem.tsx'
import List from '@/image/component/List.tsx'
import ListItem, { MovieType } from '@/image/component/ListItem.tsx'
export type DataType = {
  name: string
}
export type PropsType = {
  data: DataType
  movies: MovieType[]
}
const require = createRequire(import.meta.url)
/**
 *
 * @param param0
 * @returns
 */
export default function App({ data, movies }: PropsType) {
  return (
    <section className="flex flex-col">
      <BackgroundImage
        url={require('../../../assets/App-Store.png')}
        size={'100% auto'}
      >
        <Nav>
          {
            // 跳转到music
          }
          <NavItem href="./music">New {data.name}</NavItem>
        </Nav>
        <div>xxxxuu</div>
        <List>
          {movies.map(movie => (
            <ListItem key={movie.id} movie={movie} />
          ))}
        </List>
      </BackgroundImage>
    </section>
  )
}
