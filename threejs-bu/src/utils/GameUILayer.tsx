



export function GameUILayer(props: {forwardedRef: React.MutableRefObject<HTMLDivElement | null>, width: number, height: number}){

    return (
    <div ref={props.forwardedRef} className=' absolute z-10'
        style={{
            width: `${props.width}px`,
            height: `${props.height}px`
        }}
    >

    </div>
    )
}