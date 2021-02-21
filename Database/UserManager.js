const s = require('./Schema').users;

module.exports = class {
    constructor() {
        this.schema = s;
        this.cache = {
            id: new Map(),
            key: new Map()
        };

        s.find().then(Data => {
            Data.forEach(d => {
                if (d.ratelimit.used != 0) {
                    d.ratelimit.used = 0;
                    d.save();
                };
                this.cache.id.set(d.id, d);
                if (d.key) this.cache.key.set(d.key, d);
            });
        });

        setInterval(() => {
            s.find().then(Data => {
                Data.forEach(d => {
                    if (d.ratelimit.used != 0) {
                        d.ratelimit.used = 0;
                        d.save();
                    };
                    this.cache.id.set(d.id, d);
                    if (d.key) this.cache.key.set(d.key, d);
                });
            });
        }, 120 * 1000);
    }

    makeKey(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        console.log("the key is " + result)
        return result;
    }

    doSave(data) {
        if (!data.fromSave) data.fromSave = 0;
        if (data.fromSave >= 3) {
            data.fromSave = null;
            data.save().then(() => data.fromSave = 0);
        } else data.fromSave++;
    }

    async getID(id) {
        let data = await this.cache.id.get(id);
        if (!data) {
            data = await s.findOne({ id: id });
            this.cache.id.set(id, data);
            data = await this.cache.id.get(id);
        } else this.doSave(data);
        return data;
    };

    async getKey(key) {
        let data = await this.cache.key.get(key);
        if (!data) {
            data = await s.findOne({ key: key });
            this.cache.key.set(key, data);
            data = await this.cache.key.get(key);
        } else this.doSave(data);
        return data;
    };

    async create(id) {
        const key = this.makeKey(25);
        const data = await new s({ id: id, key: key }).save();
        this.cache.id.set(id, data)
        this.cache.key.set(key, data);
        return data;
    };

    async update(data) {
        if (data.id) this.cache.id.set(data.id, data);
        if (data.key) this.cache.key.set(data.key, data);
        return await data.save();
    }


};