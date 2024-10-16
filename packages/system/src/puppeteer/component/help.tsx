import React from 'react'
import { BOT_NAME, ConfigController } from 'yunzaijs'
import icon_abyss from '../../assets/img/icon/abyss.png'
import { LinkStyleSheet } from 'jsxp'
import output_csss from './input.css'
const icons = {
  abyss: icon_abyss
}
export default function Help({ helpData }) {
  const version = ConfigController.package.version
  return (
    <html>
      <head>
        <LinkStyleSheet src={output_csss} />
      </head>
      <body>
        <div className="container" id="container">
          <div className="head_box">
            <div className="id_text">{BOT_NAME} System</div>
            <h2 className="day_text">使用说明 V 1.0.0</h2>
          </div>
          {helpData.map((val, index) => (
            <div key={index} className="data_box">
              <div className="tab_lable">{val.group}</div>
              <div className="list">
                {val.list.map((item, index) => (
                  <div className="item" key={index}>
                    <img className="item-img" src={icons[item.icon]} />
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
      </body>
    </html>
  )
}
