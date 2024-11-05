import {parseFloatUS} from 'libbsp-js'

const header = [
    'name',
    'sequence',
    'file',
    'vol_min',
    'vol_max',
    'pitch_min',
    'pitch_max',
    'dist_min',
    'dist_max',
    'channel',
    'type',
    'probability',
    'loop',
    'masterslave',
    'loadspec',
    'subtitle',
]

export type SoundAlias = {
    // name of the alias that is used to play this sound
    name: string,
    // used to uniquely identify alias entries when more than one sound goes to an alias, used only to catch unwanted duplicates
    sequence: number,
    // the name of the file that contains the sound data
    file: string,
    // 0 is silent, 1 is full volume
    vol_min: number,
    // 0 is silent, 1 is full volume
    vol_max: number,
    // 1 is normal playback, 2 is twice as fast, 0.5 is half as fast
    pitch_min: number,
    // 1 is normal playback, 2 is twice as fast, 0.5 is half as fast
    pitch_max: number,
    // within this distance in inches, the sound is always full volume
    dist_min: number,
    // outside this distance in inches, the sound is not started.  If left blank or set to 0, the sound will play from any distance.  This does not affect sound volume falloff.
    dist_max?: number,
    channel: 'auto' | 'menu' | 'weapon' | 'voice' | 'item' | 'body' | 'local' | 'music' | 'announcer',
    type: 'streamed' | 'loaded',
    // weight to use for the weighted probability of playing this sound instead of another sound
    probability: number,
    // whether this sound is "looping" or "nonlooping"
    loop: 'looping' | 'nonlooping',
    // if "master", this is a master sound.  If a number, then this sound won't exceed this volume whenever any master sound is playing.  If blank, then neither master nor slave.
    masterslave?: 'master' | number,
    // space-separated list of which maps should use this alias; eg, "burnville dawnville".  If blank, the alias is used on all maps.
    loadspec?: string[],
    subtitle?: unknown
}

export function parseSoundAliasLine(line: string): SoundAlias {
    const items = line.trim().split(',')
    if (items.length < 3) {
        throw new Error(`SoundAlias line doesn't have enough components: ${line}`)
    }

    const obj: SoundAlias = {
        name: items[0],
        sequence: 0,
        file: items[2],
        vol_min: 1,
        vol_max: 1,
        pitch_min: 1,
        pitch_max: 1,
        dist_min: 120,
        channel: 'auto',
        type: 'loaded',
        probability: 1,
        loop: 'nonlooping',
    }

    if (items[1]) {
        const val = parseInt(items[1], 10)
        if (!isNaN(val))
            obj.sequence = val
    }

    if (items[3]) {
        const val = parseFloatUS(items[3])
        if (!isNaN(val))
            obj.vol_min = val
    }
    if (items[4]) {
        const val = parseFloatUS(items[4])
        if (!isNaN(val))
            obj.vol_max = val
    } else {
        obj.vol_max = obj.vol_min
    }

    if (items[5]) {
        const val = parseFloatUS(items[5])
        if (!isNaN(val))
            obj.pitch_min = val
    }
    if (items[6]) {
        const val = parseFloatUS(items[6])
        if (!isNaN(val))
            obj.pitch_max = val
    } else {
        obj.pitch_max = obj.pitch_min
    }

    if (items[7]) {
        const val = parseFloatUS(items[7])
        if (!isNaN(val))
            obj.dist_min = val
    }
    if (items[8]) {
        const val = parseFloatUS(items[8])
        if (!isNaN(val))
            obj.dist_max = val
    } else {
        obj.dist_max = obj.dist_min
    }

    if (items[9]) {
        // @ts-expect-error
        obj.channel = items[5]
    }
    if (items[10]) {
        // @ts-expect-error
        obj.type = items[6]
    }

    if (items[11]) {
        const val = parseFloatUS(items[11])
        if (!isNaN(val))
            obj.probability = val
    }

    if (items[12]) {
        // @ts-expect-error
        obj.loop = items[12]
    }
    if (items[13]) {
        if (items[13] === 'master') {
            obj.masterslave = 'master'
        } else {
            const val = parseFloatUS(items[13])
            if (!isNaN(val))
                obj.masterslave = val
        }
    }
    if (items[14]) {
        obj.loadspec = items[14].split(' ')
    }
    if (items[15]) {
        obj.subtitle = items[15]
    }

    return obj
}