import React from "react"
import { determineIdentityForPositionBetweenBounds } from "../../computer";

export interface RenderCallback {
  (id: any, index: number, onStartMove: Function): any
}

export interface Props {
  list: any[]
  isEditable: boolean
  children:   RenderCallback
  syncList(newList: any[]): void
}

export interface MoveApi {
  onMove(targetIndex: number): void
  onRelease(): void
}

interface State {
  internalList: any[]
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

    if (originalIndex === targetIndex) {
      throw new Error("Cannot divide by zero!")
    }

    // Test for divideByZero.
    // Should always yield 1 or -1
    const sign = (originalIndex - targetIndex) / Math.abs(originalIndex - targetIndex)

    // Sign plus 1 yields 2 or 0; divide by 2 yields 1 or 0
    // We use this value (1 or 0) to move the inclusivity/exclusivity of the identity window.
    const offset = Math.trunc((sign + 1) / 2)

    const newList: any[] = this.props.list.map((item, index) => {
      // Invert the sign for some reason.
      // Determine identity value within range.
      const identity = determineIdentityForPositionBetweenBounds(index, targetIndex + offset, originalIndex + offset, sign)
      const shiftedIndex = index + (-1 * sign) * identity

      return this.props.list[shiftedIndex]
    })

    // The ID at the original index is always placed at the target index.
    newList[targetIndex] = this.props.list[originalIndex]

    this.setState({
      internalList: newList
    })
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
          prevTargetIndex = targetIndex

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
