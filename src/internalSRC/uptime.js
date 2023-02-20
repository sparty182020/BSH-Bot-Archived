const getUptime = () => {
    const { uptime } = process
    const time = {
        year: Math.floor(Math.floor(uptime()) / 60 / 60 / 24 / 30 / 12),
        month: Math.floor(Math.floor(uptime()) / 60 / 60 / 24 / 30) % 12,
        day: Math.floor(Math.floor(uptime()) / 60 / 60 / 24) % 30,
        hour: Math.floor(Math.floor(uptime()) / 60 / 60) % 24,
        minute: Math.floor(Math.floor(uptime()) / 60) % 60,
        second: Math.floor(uptime()) % 60
    }
    return [time.year, time.month, time.day, time.hour, time.minute, time.second]
        .map((value, index) => {
            if (value === 0) return ''
            if (value === 1) {
                switch (index) {
                    case 0: return `${value} year`
                    case 1: return `${value} month`
                    case 2: return `${value} day`
                    case 3: return `${value} hour`
                    case 4: return `${value} minute`
                    case 5: return `${value} second`
                }
            } else {
                switch (index) {
                    case 0: return `${value} years`
                    case 1: return `${value} months`
                    case 2: return `${value} days`
                    case 3: return `${value} hours`
                    case 4: return `${value} minutes`
                    case 5: return `${value} seconds`
                }
            }
        })
        .filter(value => value !== '')
        .join(', ');
}

module.exports = {
    getUptime
}