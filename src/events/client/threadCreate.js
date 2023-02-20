module.exports = {
    name: 'threadCreate',
    async execute(thread) {
        await thread.join();
    }
}