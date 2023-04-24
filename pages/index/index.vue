<template>
	<view class="content">
		<view class="text-area" style="flex-direction: column;">
			<uni-file-picker v-model="files" fileMediatype="all" file-extname="mid,midi,MID,MIDI" mode="grid" :limit="1"
				@select="select" @progress="progress" @success="success" @fail="fail" />
			<br />
			<text class="title" style="color: red;">MIDI设备(output)：</text>
			<view v-for="(device, index) in outputDevices" :key="index">
				<text class="title" v-if="selectDeviceIndex == index"
					style="color: black;">{{index}}:{{device.name}}</text>
				<text class="title" v-else style="color: gray;"
					@click="selectDevice(index)">{{index}}:{{device.name}}</text>
			</view>
			<button @click="sendMidi()">发送midi</button>
		</view>
	</view>
</template>

<script>
	import {
		create
	} from 'midi-player';
	import {
		parseArrayBuffer
	} from 'midi-json-parser';

	export default {
		data() {
			return {
				outputDevices: [],
				selectDeviceIndex: 0,
				midiJson: null,
				files: [],
				midiPlayer:null,
				midiAccess:null,
				isPlay:false
			}
		},
		onLoad() {
			this.listDevices();
		},
		methods: {
			async listDevices() {
				let that = this;
				// This is a quick & dirty approach to grab the first known MIDI output.
				const midiAccess = await navigator.requestMIDIAccess();
				midiAccess.outputs.forEach(function(port, key) {
					that.outputDevices.push(port);
				})
				this.selectDevice(0);
			},
			selectDevice(index) {
				this.selectDeviceIndex = index;
			},
			initMidiDevice(){
				let _midiJson = this.midiJson;
				let _device = this.outputDevices[this.selectDeviceIndex];
				
				this.midiPlayer = create({
					json:_midiJson,
					midiOutput:_device
				});
				console.log("初始化播放器",this.midiPlayer);
			},
			loadMidi(arrayBuffer) {
				let _device = this.outputDevices[this.selectDeviceIndex];
				if(this.isPlay) _device.close();
				else _device.open();
				parseArrayBuffer(arrayBuffer).then((json) => {
					this.midiJson = json;
					console.log('选择文件：', json)
				});
			},
			async sendMidi() {
				if(this.midiJson == null){
					alert("未选中MIDI文件");
					return;
				}
				if(this.isPlay){
					alert("正在播放");
					return;
				}
				
				this.initMidiDevice();
				
				// All MIDI messages have been sent when the promise returned by play() resolves.
				this.isPlay = true;
				const play = await this.midiPlayer.play();
				console.log("play end",play);
				this.isPlay = false;
			},
			// 获取上传状态
			select(e) {
				uni.request({
					url: e.tempFilePaths[0],
					method: 'GET',
					responseType: 'arraybuffer',
					success: res => {
						this.loadMidi(res.data);
					}
				})
			},
			// 获取上传进度
			progress(e) {
				console.log('上传进度：', e)
			},

			// 上传成功
			success(e) {
				console.log('上传成功')
			},

			// 上传失败
			fail(e) {
				console.log('上传失败：', e)
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>