/*
Made by Jesen N#9071
Sengaja bikin pake bahasa indo, kalau mau ganti, ganti aja
*/
const {
  WAConnection,
  MessageType,
} = require("@adiwajshing/baileys")
const fs = require("fs")
const ms = require("parse-ms")
const db = require("quick.db")
const join = JSON.parse(fs.readFileSync("./data/join.json"))
const config = require("./data/config.json")
prefix = config.prefix
async function start() {
  const client = new WAConnection()

  client.on('qr', () => {
    console.log("Sqan Qr Code")
  })
  fs.existsSync('./jesenN.json') && client.loadAuthInfo('./jesenN.json')
  client.on('connecting', () => {
    console.log("Connecting...")
  })
  client.on('open', () => {
    fs.writeFileSync('./jesenN.json', JSON.stringify(client.base64EncodedAuthInfo(), null, '\t'))
    console.log("Connected!")
  })
  await client.connect()

  client.on('chat-update', async (sen) => {
    try {
      if (!sen.hasNewMessage) return
      sen = sen.messages.all()[0]
      global.prefix
      if (!sen.message) return
      if (sen.key && sen.key.remoteJid == 'status@broadcast') return
      if (sen.key.fromMe) return
      const type = Object.keys(sen.message)[0]
      const from = sen.key.remoteJid
      const {
        text,
        extendedText
      } = MessageType
      body = (type === 'conversation' && sen.message.conversation.startsWith(prefix)) ? sen.message.conversation: (type == 'imageMessage') && sen.message.imageMessage.caption.startsWith(prefix) ? sen.message.imageMessage.caption: (type == 'videoMessage') && sen.message.videoMessage.caption.startsWith(prefix) ? sen.message.videoMessage.caption: (type == 'extendedTextMessage') && sen.message.extendedTextMessage.text.startsWith(prefix) ? sen.message.extendedTextMessage.text: ''

      const isGroup = from.endsWith('@g.us')
      const sender = isGroup ? sen.participant: sen.key.remoteJid
      const isOwner = config.ownerNumber.includes(sender)
      const isJoin = join.includes(sender)
      const conts = sen.key.fromMe ? client.user.jid: client.contacts[sender] || {
        notify: jid.replace(/@.+/, '')
      }
      const groupMetadata = isGroup ? await client.groupMetadata(from): ''
      const groupMembers = isGroup ? groupMetadata.participants: ''
      const groupName = isGroup ? groupMetadata.subject: ''
      const username = sen.key.fromMe ? client.user.name: conts.notify || conts.vname || conts.name || '-'
      const isCmd = body.startsWith(prefix)
      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)

      //group chatlog
      if (isCmd && isGroup) {
        console.log(`[Group-Chat] From: ${username}, No: ${sender.split("@")[0]}, Group: ${groupName}, Text: ${command}`)
      }
      //private chat
      if (isCmd && !isGroup) {
        console.log(`[Private-Chat] From: ${username}, No: ${sender.split("@")[0]}, Text: ${command}`)
      }
      switch (command) {
        case 'help':
          listhelp = `Bot WA Economy\n\nCommand:\n${prefix}join (register)\n${prefix}profile\n${prefix}daily\n${prefix}work\n${prefix}balance/bal\n${prefix}pay [tag] [amount]\n${prefix}deposit/dep [all/amout]\n${prefix}withdraw/wd [all/amount]\n${prefix}gamble/gb [amount]\n${prefix}shop\n${prefix}buy [item]\n\nOwner Command:\n${prefix}add [amount] (to add your money)\n${prefix}addmoney [tag] [amount] \n\nOther:\n${prefix}about`
          client.sendMessage(from, listhelp, text, {
            quoted: sen
          })
          break;

        //jangan di hapus bro!
        case 'about':
          client.sendMessage(from, "Bot ini di buat oleh Jesen N#9071, jika kamu ingin menggunakan bot ini klik saja link yang ada di bawah!\nLink: https://github.com/Jesen-N/termux-wabot-economy", text, {
            quoted: sen
          });
          break;

        case 'join':
          if (isJoin) return client.sendMessage(from, "Kamu Sudah Register!", text, {
            quoted: sen
          })
          join.push(sender)
          fs.writeFileSync("./data/join.json", JSON.stringify(join));
          client.sendMessage(from, "Kamu Berhasil Register!", text, {
            quoted: sen
          })
          break
        case 'daily':
          if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
            quoted: sen
          })
          let dailytimeout = 86400000;
          let dailyamount = 10000;

          let daily = await db.fetch(`daily_${sender}`);

          if (daily !== null && dailytimeout - (Date.now() - daily) > 0) {
            let dailytime = ms(dailytimeout - (Date.now() - daily));

            client.sendMessage(from, `Tunggu Cooldown ${dailytime.hours} jam ${dailytime.minutes} menit, ${dailytime.seconds} detik`, text, {
              quoted: sen
            })
          } else {
            client.sendMessage(from, `Kamu memggunakan harian dan mendapatkan ${dailyamount} uang!`, text, {
              quoted: sen
            })
            db.add(`uang_${sender}`, dailyamount)
            db.set(`daily_${sender}`, Date.now())
          }
          break
        case 'work':
          if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
            quoted: sen
          })
          let orang = await db.fetch(`kerja_${   sender}`)
          let timeout = 5000
          if (orang !== null && timeout - (Date.now() - orang) > 0) {
            let time = ms(timeout - (Date.now() - orang))
            client.sendMessage(from, `Tunggu Cooldown ${time.minutes} menit, ${
              time.seconds} detik`, text, {
                quoted: sen
              })
          } else {
            let pekerjaan = ["Nguli",
              "Ngemis",
              "Pilot",
              "Hunter",
              "Peternak",
              "Polisi",
              "Dokter"] //bisa di add lagi
            let result = Math.floor(Math.random() * pekerjaan.length)
            let gaji = Math.floor(Math.random() * 2000)

            client.sendMessage(from, `Nama: ${username}\nKamu bekerja sebagai ${pekerjaan[result]} dan mendapatkan *${gaji} uang*`, text, {
              quoted: sen
            })
            db.add(`uang_${sender}`, gaji)
            db.set(`kerja_${sender}`, Date.now())
          }
          break;

        case 'bal':
          case 'balance':
            if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
              quoted: sen
            })
            let selfbal = db.fetch(`uang_${sender}`)
            let selfbank = db.fetch(`bank_${sender}`)
            if (selfbal === null) selfbal = 0
            if (selfbank === null) selfbank = 0
            if (sen.message.extendedTextMessage === undefined || sen.message.extendedTextMessage === null) {
              client.sendMessage(from, `Nama: ${username}\nUang: *${selfbal.toLocaleString()}*\nBank: *${selfbank.toLocaleString()}*`, text, {
                quoted: sen
              })
            } else {
              mentioned1 = sen.message.extendedTextMessage.contextInfo.mentionedJid[0]
              if (!mentioned1) return client.sendMessage(from, `Nama: ${username}\nUang: *${selfbal.toLocaleString()}*\nBank: *${selfbank.toLocaleString()}*`, text, {
                quoted: sen
              })
              let bankmen = groupMembers.find(x => x.jid === mentioned1)
              console.log(bankmen.jid)
              let notselfbal = db.fetch(`uang_${bankmen.jid}`)
              let notselfbank = db.fetch(`bank_${bankmen.jid}`)
              if (notselfbal === null) notselfbal = 0;
              if (notselfbank === null) notselfbank = 0;
              client.sendMessage(from, `Nama: @${bankmen.id.split('@')[0]}\nUang: *${notselfbal.toLocaleString()}*\nBank: *${notselfbank.toLocaleString()}*`, extendedText, {
                quoted: sen,
                contextInfo: {
                  "mentionedJid": [bankmen.jid]
                }
              })
            }
            break;

          case 'pay':
            if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
              quoted: sen
            })
            let payuang = db.fetch(`uang_${sender}`)
            const payamount = args[1]
            if (sen.message.extendedTextMessage === undefined || sen.message.extendedTextMessage === null) return client.sendMessage(from, "Tag seseorang yang ingin kamu pay", text)
            mentionedpay = sen.message.extendedTextMessage.contextInfo.mentionedJid[0]
            if (!payamount) return client.sendMessage(from, "Masukan jumlah uangnya!", text, {
              quoted: sen
            })
            if (isNaN(payamount)) return client.sendMessage(from, "Harus berupa angka!", text, {
              quoted: sen
            })
            if (body.includes("-") || body.includes("+")) return client.sendMessage(from, "Terdapat simbol negatif!", text, {
              quoted: sen
            })
            if (payuang == 0) return client.sendMessage(from, "Uang kamu tidak ada!", text, {
              quoted: sen
            })
            if (payuang < payamount) {
              return client.sendMessage(from, "Uang kamu tidak cukup!", text, {
                quoted: sen
              })
            }
            let paymen = groupMembers.find(x => x.jid === mentionedpay)

            if (!join.includes(paymen.jid)) {
              client.sendMessage(from, "Username tidak ada dalam daftar register!", text, {
                quoted: sen
              })
            } else {
              client.sendMessage(from,
                `Kamu Berhasil Memberikan @${paymen.id.split('@')[0]} ${payamount} Uang!`, extendedText,
                {
                  quoted: sen,
                  contextInfo: {
                    "mentionedJid": [paymen.jid]
                  }
                })
            }
            db.add(`uang_${paymen.jid}`, payamount)
            db.subtract(`uang_${sender}`, payamount)
            break;

          case 'deposit':
            case 'dep':
              if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                quoted: sen
              })
              if (body.includes("-") || body.includes("+")) return client.sendMessage(from, "Terdapat simbol negatif!", text, {
                quoted: sen
              })
              if (args[0] === "all") {
                let uangdepo = await db.fetch(`uang_${sender}`)
                if (uangdepo === 0) return client.sendMessage(from, "Kamu tidak ada uang!", text, {
                  quoted: sen
                })

                client.sendMessage(from, "Kamu berhasil mendeposit semua uang ke bank!", text, {
                  quoted: sen
                })
                db.add(`bank_${sender}`, uangdepo)
                db.subtract(`uang_${sender}`, uangdepo)
              } else {
                if (!args[0]) return client.sendMessage(from, "Masukan jumlahnya!", text, {
                  quoted: sen
                })
                if (isNaN(args[0])) return client.sendMessage(from, "Harus berupa angka!", text, {
                  quoted: sen
                })
                let uangdepo1 = db.fetch(`uang_${sender}`)
                if (uangdepo1 < args[0]) return client.sendMessage(from, "Uang kamu tidak cukup!", text, {
                  quoted: sen
                })

                client.sendMessage(from, `Kamu berhasil mendeposit uang ke bank senilai ${args[0]}!`, text, {
                  quoted: sen
                })
                db.add(`bank_${sender}`, args[0])
                db.subtract(`uang_${sender}`, args[0])
              }
              break

            case 'wd':
              case 'withdraw':
                if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                  quoted: sen
                })
                if (body.includes("-") || body.includes('+')) return client.sendMessage(from, "Terdapat simbol negatif!", text, {
                  quoted: sen
                })
                if (args[0] === "all") {
                  let uangwith = db.fetch(`bank_${sender}`)

                  if (uangwith === 0) return client.sendMessage(from, "Kamu tidak ada uang di bank!", text, {
                    quoted: sen
                  })

                  client.sendMessage(from, "Kamu berhasil mengambil semua uang dari bank!", text, {
                    quoted: sen
                  })
                  db.add(`uang_${sender}`, uangwith)
                  db.subtract(`bank_${sender}`, uangwith)
                } else {
                  if (!args[0]) return client.sendMessage(from, "Masukan jumlahnya!", text, {
                    quoted: sen
                  })
                  if (isNaN(args[0])) return client.sendMessage(from, "Harus berupa angka!", text, {
                    quoted: sen
                  })
                  let uangwith1 = db.fetch(`bank_${sender}`)
                  if (uangwith1 < args[0]) return client.sendMessage(from, "Uang kamu di bank tidak cukup!", text, {
                    quoted: sen
                  })

                  client.sendMessage(from, `Kamu berhasil mengambil uang dari bank senilai ${args[0]}!`, text, {
                    quoted: sen
                  })
                  db.add(`uang_${sender        }`, args[0])
                  db.subtract(`bank_${sender}`, args[0])
                }
                break
              case 'listbal':
                var lbno = 1;
                lbcontent = ""
                lbuser = []

                for (let lblist of groupMembers) {
                  let lbuang = db.fetch(`uang_${lblist.jid}`)
                  if (lbuang === null) lbuang = 0;
                  lbcontent += `${lbno++}. @${lblist.jid.split("@")[0]}\nUang: *${lbuang}*\n`
                  lbuser.push(lblist.jid)
                }
                client.sendMessage(from,
                  lbcontent, extendedText,
                  {
                    quoted: sen,
                    contextInfo: {
                      "mentionedJid": lbuser
                    }})
                break
              case 'gamble':
                case 'gb':
                  if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                    quoted: sen
                  })
                  let gamorang = await db.fetch(`gamble_${sender}`)
                  let gamtimeout = 10000
                  if (gamorang !== null && gamtimeout - (Date.now() - gamorang) > 0) {
                    let gamtime = ms(gamtimeout - (Date.now() - gamorang))
                    client.sendMessage(from, `Tunggu Cooldown ${gamtime.minutes} menit, ${gamtime.seconds} detik`, text, {
                      quoted: sen
                    })
                  } else {
                    let gamuang = db.fetch(`uang_${sender}`)
                    var gamnum = parseInt(args[0])
                    let gamrand = Math.floor(Math.random() * 2)
                    if (!gamnum) return client.sendMessage(from, `Tolong masukan jumlah uangnya!`, text, {
                      quoted: sen
                    })
                    if (body.includes("-") || body.includes('+')) return client.sendMessage(from, "Terdapat simbol negatif!", text, {
                      quoted: sen
                    })
                    if (gamuang < gamnum) return client.sendMessage(from, `Kamu tidak ada uang!`, text, {
                      quoted: sen
                    })
                    if (gamnum > 50000)
                      return client.sendMessage(from, `Maksimal hanya 50000 uang!`, text, {
                      quoted: sen
                    })
                    if (gamrand === 1) {
                      client.sendMessage(from, `Kamu menang dan mendapatkan *${gamnum * 2}* uang!`, text, {
                        quoted: sen
                      })
                      db.add(`uang_${sender}`, gamnum * 2)
                      db.set(`gamble_${sender}`, Date.now())
                    } else {
                      client.sendMessage(from, `Kamu kalah dan kehilangan *${gamnum}* uang...`, text, {
                        quoted: sen
                      })
                      db.subtract(`uang_${sender}`, gamnum)
                      db.set(`gamble_${sender}`, Date.now())
                    }
                  }
                  break
                case 'add':
                  if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                    quoted: sen
                  })
                  if (!isOwner) return client.sendMessage(from, "Kamu bukan owner bot!", text, {
                    quoted: sen
                  })
                  const amountadd = args[0]
                  if (!amountadd) return client.sendMessage(from, `Masukan jumlah uangnya!`, text, {
                    quoted: sen
                  })
                  client.sendMessage(from, `Berhasil menambahkan ${amountadd} uang!`, text, {
                    quoted: sen
                  })
                  db.add(`uang_${sender}`, amountadd)
                  break
                case 'addmoney':
                  if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                    quoted: sen
                  })
                  if (!isOwner) return client.sendMessage(from, "Kamu bukan owner bot!", text, {
                    quoted: sen
                  })
                  let addmarg = args[1]
                  if (sen.message.extendedTextMessage === undefined || sen.message.extendedTextMessage === null) return client.sendMessage(from, "Tag seseorang yang ingin kamu berikan uang!", text);
                  if (!addmarg) return client.sendMessage(from, "Tolong masukan jumlah uangnya!", text, {
                    quoted: sen
                  })
                  if (isNaN(addmarg)) return client.sendMessage(from, "Harus berupa angka!", text, {
                    quoted: sen
                  })
                  if (body.includes("-") || body.includes("+")) return client.sendMessage(from, "Terdapat simbol negatif!", text, {
                    quoted: sen
                  })
                  if (!addmarg) return client.sendMessage(from, "Masukan jumlah uang nya!", text, {
                    quoted: sen
                  })
                  mentioned2 = sen.message.extendedTextMessage.contextInfo.mentionedJid[0]

                  let adm = groupMembers.find(y => y.jid === mentioned2)
                  if (!join.includes(adm.jid)) {
                    client.sendMessage(from, "Username tidak ada dalam daftar register!", text, {
                      quoted: sen
                    })
                  } else {
                    client.sendMessage(from,
                      `Berhasil Memberikan @${adm.id.split('@')[0]} ${addmarg} Uang`, extendedText,
                      {
                        quoted: sen,
                        contextInfo: {
                          "mentionedJid": [adm.jid]
                        }
                      })
                    db.add(`uang_${adm.jid}`, addmarg)
                  }
                  break

                case 'shop':
                  if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                    quoted: sen
                  })
                  client.sendMessage(from, `Bot Shop\nHow to buy? ${prefix}buy <item>\n\nItem:\n> sword\n\nCooldown: Unlimited\nDesc: You can get more money than 5.000 \nPrice: 500.000`, text, {
                    quoted: sen
                  })
                  break

                case 'buy':
                  if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                    quoted: sen
                  })
                  if (!args[0]) return client.sendMessage(from, "Masukan nama item nya!", text, {
                    quoted: sen
                  })

                  if (args[0] === "sword") {
                    let sword = db.fetch(`sword_b_${sender}`)
                    let suang = db.fetch(`uang_${sender}`)
                    if (suang < 500000) return client.sendMessage(from, "Uang kamu tidak cukup!", text, {
                      quoted: sen
                    })
                    if (sword) return client.sendMessage(from, "Kamu sudah membeli item sword!", text, {
                      quoted: sen
                    })
                    client.sendMessage(from, `Kamu membeli sword seharga 500.000 uang!\ncara pakai: ${prefix}use sword`, text, {
                      quoted: sen
                    })
                    db.add(`sword_b_${sender}`, 1)
                    db.subtract(`uang_${sender}`, 500000)
                  }
                  break

                case 'use':
                  if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                    quoted: sen
                  })
                  let sresult = Math.floor(Math.random() * 7000) + 5000
                  let suse = await db.fetch(`use_${sender}`)
                  let stimeout = 10000
                  if (suse !== null && stimeout - (Date.now() - suse) > 0) {
                    let stime = ms(stimeout - (Date.now() - suse))
                    client.sendMessage(from, `Tunggu Cooldown ${stime.minutes} menit, ${stime.seconds} detik`, text, {
                      quoted: sen
                    })
                  } else {
                    let usword = db.fetch(`sword_b_${sender}`)
                    if (usword < 1) return client.sendMessage(from, "Sword kamu sudah habis!", text, {
                      quoted: sen
                    })
                    if (args[0] === "sword") {
                      client.sendMessage(from, `Kamu menggunakan sword dan mendapatkan ${sresult} uang!`, text, {
                        quoted: sen
                      })
                      db.add(`uang_${sender}`, sresult)
                      db.subtract(`sword_b_${sender}`, 0)
                      db.set(`use_${sender}`, Date.now())
                    }
                  }
                  break
                case 'profile':
                  if (!isJoin) return client.sendMessage(from, `Kamu belum register! ketik ${prefix}join`, text, {
                    quoted: sen
                  })
                  let swordp = db.fetch(`sword_b_${sender}`)
                  if (swordp === 1) swordp = "✅"
                  client.sendMessage(from, `Nama: ${username}\n\nItem yang terpakai:\nSword: ${swordp}`, text, {
                    quoted: sen
                  })
                  break
            }
        } catch(err) {
          console.log(err)
      }
    })
  }
  start()
