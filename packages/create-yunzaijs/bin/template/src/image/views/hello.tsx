import React from 'react'
import { BackgroundImage } from 'jsxp'
import Nav from '@src/image/component/Nav.tsx'
import NavItem from '@src/image/component/NavItem.tsx'
import List from '@src/image/component/List.tsx'
import ListItem, { MovieType } from '@src/image/component/ListItem.tsx'
export type DataType = {
  name: string
}
export type PropsType = {
  data: DataType
  movies: MovieType[]
}

import img_url from '@src/assets/App-Store.png'

/**
 *
 * @param param0
 * @returns
 */
export default function App({ data, movies }: PropsType) {
  return (
    <html>
      <head></head>
      <body>
        <section className="flex flex-col">
          <BackgroundImage url={img_url} size={'100% auto'}>
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
      </body>
    </html>
  )
}
