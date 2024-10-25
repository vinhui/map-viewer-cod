import {int} from '../../utils/number'

export class StringExtensions {
    public static SplitUnlessInContainer(st: string, separator: string, container: string, removeEmptyItems: boolean = false): string[] {
        if (st.indexOf(separator) < 0) {
            return [st]
        }
        if (st.indexOf(container) < 0) {
            return st.split(separator)
        }
        const result: string[] = []
        let inContainer = false
        let current = ''

        for (let c of st) {
            if (c === container) {
                inContainer = !inContainer
                current += c
            }

            if (!inContainer) {
                if (c === separator) {
                    if (removeEmptyItems) {
                        if (current.length > 0) {
                            result.push(current)
                        }
                        current = ''
                    } else {
                        result.push(current)
                        current = ''
                    }
                } else {
                    current += c
                }
            } else {
                current += c
            }
        }

        if (current.length > 0) {
            result.push(current)
        }
        return result
    }

    public static SplitUnlessBetweenDelimiters(st: string, separater: string, start: string, end: string, removeEmptyItems: boolean = false): string[] {
        const result: string[] = []
        let containerLevel = 0
        let current = ''
        for (let c of st) {
            if (c === start) {
                containerLevel++
                if (containerLevel === 1) {
                    continue
                }
            }

            if (c === end) {
                containerLevel--
                if (containerLevel === 0) {
                    continue
                }
            }

            if (containerLevel === 0) {
                if (c === separater) {
                    if (removeEmptyItems) {
                        if (current.length > 0) {
                            result.push(current)
                        }
                        current = ''
                    } else {
                        result.push(current)
                        current = ''
                    }
                } else {
                    current += c
                }
            } else {
                current += c
            }
        }

        if (current.length > 0) {
            result.push(current)
        }

        return result
    }

    public static ToNullTerminatedString(bytes: Uint8Array, offset: int = 0, length: int = -1): string {
        let sb = ''
        for (let i = 0; i < bytes.length; i++) {
            if (i > length && length >= 0) {
                break
            }
            if (bytes[i + offset] === 0) {
                break
            }
            sb += String.fromCharCode(bytes[i + offset])
        }
        return sb
    }

    public static ToRawString(bytes: Uint8Array): string {
        let sb = ''
        for (let i = 0; i < bytes.length; i++) {
            sb += String.fromCharCode(bytes[i])
        }
        return sb
    }
}