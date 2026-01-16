export default function Topbar() {
    return (
        <div className="flex w-full h-full bg-white item-center gap-3 border border-black-200 text-zinc-400">
            <span className="text-lg">Search</span>
            <input placeholder="Search" className="w-full max-w-sm bg-transparent border border-black-500 rounded-full px-5 placeholder:text-zinc-400 text-zinc-700"></input>
        </div>
    );
}