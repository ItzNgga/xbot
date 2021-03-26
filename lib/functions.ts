/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
import fetch from 'node-fetch';
import moment from 'moment';
import axios from 'axios';
import striptags from 'striptags';
import ytdl from 'ytdl-core';
import brain from 'brainly-scraper-v2';
import pretty from 'pretty-bytes';
import {WAGroupParticipant} from '@adiwajshing/baileys';
import {settingType, configType} from '../types/index';
import fs from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
import { DB } from 'src/login';
const translatte = require('translatte');
const ytSearch = require('yt-search');
const tesseract = require('node-tesseract-ocr');
const {spawn} = require('child_process');
const {JSDOM} = require('jsdom');
const momentDur = require('moment-duration-format');
momentDur(moment);

export default class Function {
	private setting: settingType;
	private config: configType;
	constructor(private DB: DB) {
		this.setting = this.DB.setting;
		this.config = this.DB.config;
	}
	post(url: string, formdata: any) {
		return fetch(url, {
			method: 'POST',
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.9',
				'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
			},
			body: Object.keys(formdata)
				.map(key => `${key}=${encodeURIComponent(formdata[key])}`)
				.join('&'),
		});
	}
	formatTrue(target: boolean): string {
		if (target) {
			return 'Ya';
		} else {
			return 'Tidak';
		}
	}
	curlyRemover(chat: string): string {
		if (chat !== undefined) {
			const sr = /{(.*?)}/g;
			const ket = chat.toString().replace(sr, '');
			return ket;
		}
		return chat;
	}
	quoted = (maker: string, quote: string): Promise<any> =>
		new Promise(async (resolve, reject) => {
			const response = await fetch(
				`https://terhambar.com/aw/qts/?kata=${quote}&author=${maker}&tipe=random`
			);
			if (!response.ok) reject(`unexpected response ${response.statusText}`);
			const json = await response.json();
			if (json.status) {
				if (json.result !== '') {
					return resolve(json.result);
				}
			}
		});
	ytmp3 = async (url: string): Promise<any> => {
		const response = await fetch('http://scrap.terhambar.com/yt?link=' + url);
		if (!response.ok)
			throw new Error(`unexpected response ${response.statusText}`);
		const json = await response.json();
		if (json.status) return json.linkAudioOnly;
	};
	wallpaperanime = async (): Promise<any> => {
		const response = await fetch('https://nekos.life/api/v2/img/wallpaper');
		if (!response.ok) throw new Error('unexpected response');
		const json = await response.json();
		return json.url;
	};
	anime = (judulanime: string): any =>
		new Promise(async (resolve, reject) => {
			const response = await fetch(
				'https://api.jikan.moe/v3/search/anime?q=' + judulanime + '&limit=1'
			);
			if (!response.ok) return reject('Anime tidak di temukan!');
			const json = await response.json();
			const {
				title,
				synopsis,
				episodes,
				url,
				rated,
				score,
				airing,
				start_date,
				end_date,
				image_url,
			} = json.results[0];
			return resolve({
				formated: `_*「 Anime 」*_
	• _title : ${title}_
	• _episodes : *${episodes}*_
	• _tayang : *${this.formatTrue(airing)}*_
	• _rating : *${rated}*_
	• _score : *${score}*_
	• _mulai : ${moment(start_date).format('LL')}_
	• _akhir : ${moment(end_date).format('LL')}_
	• _synopsis_ :
	${synopsis}
	• URL : ${url}
	
	_*「 XyZ BOT Automation 」*_`,
				image: image_url,
			});
		});
	quotes = async () => {
		const response = await fetch('https://api.terhambar.com/qts/');
		if (!response.ok)
			throw new Error(`unexpected response ${response.statusText}`);
		const json = await response.json();
		if (json.status) return json.quotes;
	};
	// const nhentai = async (nuclear: number) =>
	//   new Promise(async (resolve, reject) => {
	//     const NanaAPI = require("nana-api");
	//     const nana = new NanaAPI();
	//     nana
	//       .g(nuclear)
	//       .then((g) => {
	//         const { id, num_pages, tags, title } = g;
	//         const tag = (tags) => {
	//           let theTag = "";
	//           for (let tag of tags) {
	//             theTag += tag.name + ",";
	//           }
	//           return theTag;
	//         };
	//         return resolve(`_*「 Doujin Information 」*_
	// • _title_ : ${title.pretty}
	// • _pages_ : ${num_pages}
	// • _tags_ :
	// ${tag(tags)}
	// • _link_ : https://nhentai.net/g/${id}
	// _*「 XyZ BOT Automation 」*_`);
	//       })
	//       .catch((err) => {
	//         return reject(err);
	//       });
	//   });
	meme = (): Promise<any> =>
		new Promise(async (resolve, reject) => {
			const response = await fetch(
				'https://meme-api.herokuapp.com/gimme/wholesomeanimemes'
			);
			if (!response.ok) reject(`unexpected response ${response.statusText}`);
			const json = await response.json();
			return resolve({
				title: json.title,
				link: json.url,
			});
		});
	corona = (): Promise<string> =>
		new Promise(async (resolve, reject) => {
			axios
				.all([
					axios.get('https://covid19.mathdro.id/api'),
					axios.get('https://covid19.mathdro.id/api/countries/id'),
				])
				.then(res => {
					const hasil = res[0]?.data;
					const id = res[1]?.data;
					function intl(str: bigint): string {
						const nf = Intl.NumberFormat();
						return nf.format(str);
					}
					let date = moment(id.lastUpdate).fromNow();
					translatte(date, {to: 'id'}).then((res: any) => {
						date = res.text;
						return resolve(`_*「 Kasus COVID19 di Dunia 」*_
	• Positif : ${intl(hasil.confirmed.value)} kasus
	• Sembuh : ${intl(hasil.recovered.value)} kasus
	• Meninggal : ${intl(hasil.deaths.value)} kasus
	
	_*「 Kasus COVID19 di Indonesia 」*_
	• Positif : ${intl(id.confirmed.value)} kasus
	• Sembuh : ${intl(id.recovered.value)} kasus
	• Meninggal : ${intl(id.deaths.value)} kasus
	
	_*「 Tips Kesehatan 」*_
	- Mencuci tangan dengan benar
	- Menggunakan masker
	- Menjaga daya tahan tubuh
	- Menerapkan physical distancing
	
	_*「 XyZ BOT Information 」*_
	⊢ _Update terakhir ${date}_`);
					});
				})
				.catch(err => {
					return reject(err);
				});
		});
	brainly = (question: string): Promise<string> =>
		new Promise(async (resolve, reject) => {
			try {
				let hasilnya =
					'_*「 Hasil Pencarian Brainly 」*_\n-----------------------------------------\n\n';
				brain(question, 10)
					.then((hasil: any) => {
						if (hasil.length === 0) return reject('Soal tidak ada!');
						let counter = 1;
						const checker = hasil.success;
						if (checker) {
							for (const i of hasil.data) {
								hasilnya += `_*Pertanyaan ke ${counter}*_\n• Judul : \n${i.pertanyaan}\n• Jawaban : \n${i.jawaban[0].text}\n\n`;
								counter++;
							}
							return resolve(
								hasilnya +
									'-----------------------------------------\n_*「 XyZ BOT Automation 」*_'
							);
						} else {
							return reject('Soal tidak ada!');
						}
					})
					.catch(err => console.log(err));
			} catch (error) {
				reject('Pertanyaan tidak ada!');
			}
		});
	simsimichat = async (chat: string): Promise<any> => {
		const response = await fetch(
			`https://simsumi.herokuapp.com/api?text=${chat}&lang=id`
		);
		if (!response.ok) throw new Error('unexpected response');
		const json = await response.json();
		return json.success;
	};
	wait = (media: Buffer): Promise<string> =>
		new Promise(async (resolve, reject) => {
			const attachmentData = `data:image/jpeg;base64,${media.toString('base64')}`;
			const response = await fetch('https://trace.moe/api/search', {
				method: 'POST',
				body: JSON.stringify({image: attachmentData}),
				headers: {'Content-Type': 'application/json'},
			});
			if (!response.ok) reject('Gambar tidak ditemukan!');
			const result = await response.json();
			const ecch = () => (result.docs[0].is_adult ? 'Iya' : 'Tidak');
			resolve(`_*「 Whats Anime Is That 」*_
	• _ecchi : *${ecch()}*_
	• _judul jepang : ${result.docs[0].title}_
	• _ejaan judul : ${result.docs[0].title_romaji}_
	• _ejaan inggris : ${result.docs[0].title_english}_
	• _episode : ${result.docs[0].episode}_
	• _season  : ${result.docs[0].season}_
	
	_*「 XyZ BOT Automation 」*_`);
		});
	removeBg = (media: Buffer): Promise<Buffer> =>
		new Promise(async (resolve, reject) => {
			const response = await fetch('https://api.remove.bg/v1.0/removebg', {
				method: 'POST',
				body: JSON.stringify({
					image_file_b64: media.toString('base64'),
					size: 'auto',
					format: 'png',
				}),
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': 'td6vn856xXLNc67iEAxCrkhd',
				},
			});
			if (!response.ok) reject('Gambar tidak valid!');
			return resolve(await response.buffer());
		});
	ig = (url: string): Promise<any> =>
		new Promise(async (resolve, reject) => {
			const response = await fetch(
				`https://api.i-tech.id/dl/igdl?key=${this.config.apikeys.tech}&link=${url}`
			);
			const json = await response.json();
			if (json.status === 'error')
				return reject('Error, user private/link tidak valid');
			const type = () => (json.result[0].type === 'image' ? '.jpg' : '.mp4');
			return resolve({url: `${json.result[0].url}`, type: type()});
		});
	surat = (surah: number, ayat: number): Promise<string> =>
		new Promise(async (resolve, reject) => {
			if (!isNaN(surah) && surah <= 114) {
				if (ayat !== undefined) {
					axios
						.get(
							`https://api.banghasan.com/quran/format/json/surat/${surah}/ayat/${ayat}`
						)
						.then(res => {
							if (!res.data.ayat.error) {
								let hasil = `_*Surah ${res.data.surat.nama} ayat ${ayat}*_\n-----------------------------------------\n`;
								const indexs = res.data.ayat.data.ar;
								const a = res.data.ayat.data.idt;
								const b = res.data.ayat.data.id;
								Object.keys(indexs).forEach(i => {
									hasil += `*[ ${indexs[i].ayat} ]*  ${indexs[i].teks}\n`;
									hasil += `\n${striptags(a[i].teks)}\n`;
									hasil += `\n_*Artinya*_ : ${this.curlyRemover(b[i].teks)}\n`;
								});
								resolve(
									hasil +
										'-----------------------------------------\n_*「 XyZ BOT Automation 」*_'
								);
							} else {
								reject(`Error, ayat ${ayat} dari surah ${surah} tidak valid!`);
							}
						});
				} else {
					axios
						.get(`https://api.banghasan.com/quran/format/json/surat/${surah}`)
						.then(res => {
							const sr = /<(.*?)>/gi;
							const hs = res.data.hasil[0];
							const ket = `${hs.keterangan}`.replace(sr, '');
							resolve(`_*「 Surah ${hs.nama} 」*_
	• Nomor : ${hs.nomor}
	• Asma : ${hs.asma}
	• Tipe : ${hs.type}
	• Urut : ${hs.urut}
	• Ruku : ${hs.rukuk}
	• Arti : ${hs.arti}
	• Jumlah Ayat : ${hs.ayat}
	----------------------------------------
	${ket}\n-----------------------------------------\n_*「 XyZ BOT Automation 」*_`);
						});
				}
			} else {
				reject(
					`Error, nomor surah ${surah} tidak valid\n*${this.setting.prefix}list surah* • menampilkan list surah`
				);
			}
		});
	yts = (str: string): Promise<string> =>
		new Promise(async (resolve, reject) => {
			try {
				const search = await ytSearch(str);
				const hasil = search.videos.slice(0, 3);
				let formatted = `*「 Youtube Search 」*
	• _query : ${str}\n\n_`,
					counter = 1;
				for (const i of hasil) {
					formatted += `🎞 *Video ke-${counter}* 🎞
	• _judul : ${i.title}_
	• _durasi : *${i.timestamp} menit*_
	• _views : *${i.views}*_
	• _channel : *${i.author.name}*_
	• _link : *${i.url}*_\n\n`;
					counter++;
				}
				return resolve(
					formatted +
						`• _gunakan\n${this.setting.prefix}yt / ${this.setting.prefix}ymp3 untuk mendownload_\n-----------------------------------------\n_*「 XyZ BOT Automation 」*_`
				);
			} catch (error) {
				return reject('Query tidak valid!');
			}
		});
	imp3 = (query: string): Promise<any> =>
		new Promise(async (resolve, reject) => {
			const searchx = await ytSearch(query);
			const url = searchx.videos[0].url;
			const videoid = url.match(
				/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/
			);
			fs.access(
				'../temp/' + videoid[1] + '.m4a',
				fs.constants.F_OK,
				(err: any) => {
					if (!err) {
						return resolve({id: videoid[1]});
					} else {
						ytdl
							.getInfo(videoid[1])
							.then(info => {
								if (parseInt(info.videoDetails.lengthSeconds) > 1000) {
									return reject(
										'Videonya terlalu panjang gan, coba yang lain :v'
									);
								} else {
									const stream = ytdl(videoid[1], {
										quality: 'highestaudio',
										requestOptions: {
											headers: {
												cookie: this.config.ytCookie,
												'x-youtube-identity-token': this.config.ytIdentity,
											},
										},
									});
									stream.on('error', () => {
										return reject('Video tidak valid/sedang error');
									});
									ffmpeg(stream)
										.audioCodec('aac')
										.addOutputOptions('-map 0:a')
										.save(`../temp/${videoid[1]}.m4a`)
										.on('end', () => {
											resolve({
												id: videoid[1],
												title: info.videoDetails.title,
												time: moment.duration(
													info.videoDetails.lengthSeconds,
													'second'
												),
											});
										});
								}
							})
							.catch(err => {
								console.log(err);
								return reject('Video tidak valid/sedang error');
							});
					}
				}
			);
		});
	cuaca = (kota: string): Promise<string> =>
		new Promise(async (resolve, reject) => {
			const response = await fetch(
				`https://api.openweathermap.org/data/2.5/weather?q=${kota}&appid=d4f4046ff211ca0287ccea5c28ad4b0f&lang=id&units=metric`
			);
			if (!response.ok) return reject(`Kota ${kota} tidak valid/Sedang Error`);
			const json = await response.json();
			const hasil = `*「 Kondisi Cuaca ${kota} 」*
	• _info : ${json.weather[0].description}_
	• _temp : *${json.main.feels_like}°*_
	• _tekanan : *${json.main.pressure} mb*_
	• _kelembaban : *${json.main.humidity} %*_
	• _jarak pandang : *${json.visibility / 1000} km*_
	• _angin : *${json.wind.speed} km/h*_
	• _awan : *${json.clouds.all} %*_\n\n`;
			return resolve(hasil + '_*「 XyZ BOT Automation 」*_');
		});
	ocr = (id: string): Promise<string> =>
		new Promise(async (resolve, reject) => {
			tesseract
				.recognize(`../temp/${id}.jpeg`, {lang: 'eng+ind', oem: 1, psm: 3})
				.then((text: string) => {
					fs.unlink(`../temp/${id}.jpeg`, () => {});
					if (!text.trim())
						return reject('Text tidak terbaca, coba gambar lain!');
					return resolve(text);
				})
				.catch((error: string) => {
					console.log(error);
				});
		});
	extract = (id: string): Promise<string> =>
		new Promise((resolve, reject) => {
			const udud = spawn('ffmpeg', [
				'-y',
				'-vn',
				'-i',
				`../extract/${id}.mp4`,
				'-codec:a',
				'libmp3lame',
				`../extract/${id}.ogg`,
			]);
			udud.on('close', () => {
				const buff = fs.readFileSync('../extract/' + id + '.ogg');
				const formated = `data:audio/mp3;base64,${buff.toString('base64')}`;
				return resolve(formated);
			});
			udud.on('error', (err: any) => {
				return reject(err);
			});
		});
	food = (): any =>
		new Promise(async (resolve, reject) => {
			const response = await fetch('https://foodish-api.herokuapp.com/api');
			if (!response.ok) return reject('Sedang Error');
			const json = await response.json();
			return resolve(json.image);
		});
	getGroupAdmins = (
		participants: WAGroupParticipant[]
	): string[] => {
		const admins: string[] = [];
		for (const i of participants) {
			i.isAdmin ? admins.push(i.jid) : '';
		}
		return admins;
	};
	modifExif = (
		buffer: Buffer,
		id: string,
		callback: (res: Buffer) => void
	) => {
		fs.writeFileSync('../temp/' + id + '.webp', buffer);
		const {spawn} = require('child_process');
		spawn('webpmux', [
			'-set',
			'exif',
			'../src/data.exif',
			'../temp/' + id + '.webp',
			'-o',
			'../temp/' + id + '.webp',
		]).on('exit', () => {
			callback(fs.readFileSync('../temp/' + id + '.webp'));
			fs.unlink('../temp/' + id + '.webp').then(() => {});
		});
	};
	getBuffer = (url: string): Promise<Buffer> =>
		new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(url);
				if (!response.ok) return reject('Sedang Error');
				return resolve(response.buffer());
			} catch (error) {
				console.log(error);
				return reject('Sedang Error');
			}
		});
	ytv = (url: string): any =>
		new Promise((resolve, reject) => {
			const ytId: any = url.match(
				/(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\\-nocookie|)\.com\/(?:watch\?.*(?:|\\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
			);
			if (ytId) {
				url = 'https://youtu.be/' + ytId[1];
				this.post('https://www.y2mate.com/mates/en60/analyze/ajax', {
					url,
					q_auto: 0,
					ajax: 1,
				})
					.then((res: any) => res.json())
					.then((res: any) => {
						const s = new JSDOM(res.result);
						const document = s.window.document;
						const yaha = document.querySelectorAll('td');
						const filesize = yaha[yaha.length - 23].innerHTML;
						const id = /var k__id = "(.*?)"/.exec(document.body.innerHTML) || [
							'',
							'',
						];
						const thumb = document.querySelector('img').src;
						const title = document.querySelector('b').innerHTML;
						this.post('https://www.y2mate.com/mates/en60/convert', {
							type: 'youtube',
							_id: id[1],
							v_id: ytId[1],
							ajax: '1',
							token: '',
							ftype: 'mp4',
							fquality: 360,
						})
							.then((res: any) => res.json())
							.then((res: any) => {
								resolve({
									dl_link: /<a.+?href="(.+?)"/.exec(res.result)![1],
									thumb,
									title,
									filesizeF: filesize,
									filesize: pretty(filesize),
								} as any);
							})
							.catch(reject);
					})
					.catch(reject);
			} else reject('URL INVALID');
		});
	urlShortener = (url: string): Promise<any> => {
		return new Promise(async (resolve, reject) => {
			await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
				.then(response => response.text())
				.then(json => {
					resolve(json);
				})
				.catch(err => {
					reject(err);
				});
		});
	};
	color = (text: string, color?: string): string => {
		switch (color) {
			case 'red':
				return '\x1b[31m' + text + '\x1b[0m';
			case 'yellow':
				return '\x1b[33m' + text + '\x1b[0m';
			default:
				return '\x1b[32m' + text + '\x1b[0m'; // default is green
		}
	};
}

