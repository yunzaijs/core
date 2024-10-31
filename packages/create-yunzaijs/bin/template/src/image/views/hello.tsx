import React from 'react'
import { BackgroundImage, LinkStyleSheet } from 'jsxp'
import Nav from '@src/image/component/Nav.tsx'
import NavItem from '@src/image/component/NavItem.tsx'
import List from '@src/image/component/List.tsx'
import ListItem from '@src/image/component/ListItem.tsx'
import css_output from './input.css'
import img_url from '@src/assets/App-Store.png'
/**
 *
 * @param param0
 * @returns
 */
export default function App({ data, movies }) {
  return (
    <html>
      <head>
        <LinkStyleSheet src={css_output} />
      </head>
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
