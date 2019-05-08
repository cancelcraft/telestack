import React from "react"


interface Children {
  (id: any, index: number, onStartMove: Function): any
}

interface Props {
  list: any[]
  isEditable: boolean
  children:   Children
  syncList(newList: any[]): void
}

interface State {
  internalList: any[]
}

interface MoveApi {

}

export default class Telestack extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      internalList: props.list
    }
  }

  /**
   * As the gesture moves, if a new index is targeted, show the item at the original index moved to the target index.
   * This method performs the swapping of items.
   */
  private increment = (originalIndex: number, targetIndex: number) => {
  }

  private onStartMove = (originalIndex: number) => (): MoveApi => {
    let prevTargetIndex = -1 // This is getting overwritten.
    const { length: listLength } = this.props.list

    /**
     * The MoveAPI validates the incoming target index and distinguishes between move and release calls.
     */
    return {
      onMove: (targetIndex: number) => {

        // If targetIndex equals originalIndex, there will be a divide by zero error.
        if (targetIndex !== prevTargetIndex && (targetIndex >= 0 && targetIndex < listLength) && targetIndex !== originalIndex) {
          prevTargetIndex = targetIndex\

          this.increment(originalIndex, targetIndex)
        }
      },

      onRelease: () => {
        // OnRelease will sync the source list to the internal state.
        if (prevTargetIndex !== -1 && prevTargetIndex !== originalIndex) {

          this.props.syncList(this.state.internalList)
        }
      }
    } as MoveApi
  }

  render() {
    const [ first ] = this.props.list

    return <React.Fragment>{
      !this.props.isEditable
        ? this.props.children(first, 0, this.onStartMove(0))
        : this.state.internalList.map((id, index) => this.props.children(id, index, this.onStartMove(index)))
    }</React.Fragment>
  }
}
