


export function GameContainerLayer(props: {forwardRef: React.MutableRefObject<HTMLDivElement | null>}){

    return (
        <div ref={props.forwardRef} className=' absolute z-0 w-fit h-fit'>

        </div>
    )
}