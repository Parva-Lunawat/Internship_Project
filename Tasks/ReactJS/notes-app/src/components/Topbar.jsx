export default function Topbar({value, onChange}) {
    return (
        <div className="flex w-full h-full bg-zinc-100  justify-center item-center gap-3 text-zinc-400">
            <span className="text-lg"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>
</span>
            <input value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search" 
                className="w-full max-w-sm bg-transparent border border-black-500 rounded-full px-5 placeholder:text-zinc-400 text-zinc-700 focus:bg-white"></input>
        </div>
    );
}