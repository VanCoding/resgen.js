var Transform = require("stream").Transform;

function Stream(name,opts){
    Transform.call(this);
    this.name = name;
    this.maxLineLength = (opts?opts.lineLength:false)||100;
    this.lineLength = 0;
    this.length = 0;
    this.pushBuffer(new Buffer("Resource "+name+" = {\"","binary"));
}

Stream.prototype = Object.create(Transform.prototype);

Stream.prototype._transform = function(chunk,encoding,cb){
    this.length += chunk.length;
    for(var i = 0; i < chunk.length; i++){
        this.pushBuffer(this.transformByte(chunk[i]));
    }
    cb();
}

Stream.prototype._flush = function(cb){
    this.pushBuffer(new Buffer("\","));   
    this.pushBuffer(new Buffer(this.length+"};\n"));
    cb();
}

Stream.prototype.transformByte = function(byte){
    if(byte == 34 || byte == 92){
        return new Buffer([92,byte]);
    }else if(byte >= 32 && byte <= 126){
        return new Buffer([byte]);
    }else{
        return this.octalEncode(byte);
    }
}

Stream.prototype.pushBuffer = function(buf){
    this.lineLength += buf.length;
    if(this.length > 0 && this.lineLength > this.maxLineLength){
        this.lineLength = buf.length;
        this.push(new Buffer("\\\n"));
    }
    this.push(buf);
}

Stream.prototype.octalEncode = function(byte){
    if(byte >= 64) return new Buffer([92,48+((byte>>6)&7),48+((byte>>3)&7),48+(byte&7)])
    return new Buffer([92,48+((byte>>3)&7),48+(byte&7)]);
}
module.exports = Stream;