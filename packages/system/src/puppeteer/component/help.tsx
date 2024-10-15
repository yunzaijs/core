import React from 'react'
import { BOT_NAME, ConfigController } from 'yunzai'
import { createRequire } from 'react-puppeteer'
import { readFileSync } from 'fs'
const require = createRequire(import.meta.url)
const dir = require('../../../package.json')
export default function Help({ helpData }) {
  const version = ConfigController.package.version
  const data = JSON.parse(readFileSync(dir, 'utf-8'))
  return (
    <>
      <div className="container" id="container">
        <div className="head_box">
          <div className="id_text">{BOT_NAME} System</div>
          <h2 className="day_text">使用说明 V{data.version}</h2>
        </div>
        {helpData.map((val, index) => (
          <div key={index} className="data_box">
            <div className="tab_lable">{val.group}</div>
            <div className="list">
              {val.list.map((item, index) => (
                <div className="item" key={index}>
                  <img
                    className="item-img"
                    src={require(`../../../assets/img/icon/${item.icon}.png`)}
                  />
                  <div className="title">
                    <div className="text">{item.title}</div>
                    <div className="dec">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="logo">
          Created By {BOT_NAME} V{version}
        </div>
      </div>
    </>
  )
}
