importScripts('../third_party/mp4boxjs/mp4box.all.min.js');

class Demuxer {
    #file = null

    constructor() {
        this.#file = MP4Box.createFile();
    }

    async load(uri) {
        const response = await fetch(uri);
        const reader = response.body.getReader();
        let offset = 0;
        let mp4File = this.#file;

        function appendBuffers({done, value}) {
            if(done) {
              mp4File.flush();
              return;
            }
            let buf = value.buffer;
            buf.fileStart = offset;

            offset += buf.byteLength;
            mp4File.appendBuffer(buf);
            return reader.read().then(appendBuffers);
        }

        return reader.read().then(appendBuffers);
    }



}