import React from "react"
import { View, PanResponder, PanResponderInstance } from "react-native";

export interface GestureApi {
  onMove(dx: number, dy: number): void
  onRelease(): void
}

export interface Props {
  top: number
  left: number
  isExploded: boolean
  onMoving(): GestureApi
  setRef(instance: View | null): void
  animate(duration: number, toLeft: number, toTop: number): void
}

export default class MoveableTile extends React.Component<Props> {
  private pr: PanResponderInstance
  private hasMoved = false
  private isLifted = false
  private moveApi!: GestureApi
  private initialLeft = -1
  private initialTop = -1

  constructor(props: Props) {
    super(props)
    this.pr = PanResponder.create(this)
  }

  onMoveShouldSetPanResponder = (e, gesture) => {
    const { dx, dy } = gesture
    const threshold = 10 // The downside to this is it won't start animating the component until past the threshold...But it's a minor thing.

    const isGestureIntendedToMove = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) > threshold

    if (isGestureIntendedToMove) {

      this.initialTop   = this.props.top
      this.initialLeft  = this.props.left

      this.moveApi = this.props.onMoving()
    }

    // The tiles should be moveable only if the list is exploded.
    return isGestureIntendedToMove && this.props.isExploded
  }

  onPanResponderMove = (e, gesture) => {
    const { dx, dy } = gesture
    const { initialLeft: left, initialTop: top } = this

    if (dx !== 0 || dy !== 0) {
      this.isLifted = true
      this.hasMoved = true

      // TODO _ Use the transform property to animate with better performance.
      // TODO _ This needs to go through the animate API
      // BUG!!! _ When this thing is moved (say from 0, 0 to 20, 20) then the onRelease needs to move it from 20, 20 to its new position.
      // The problem is that the record of the state is in the AnimatedTile...
      // But since AnimatedTile is an enhanced version of MoveableTile, we can test through AnimatedTile.
      this.props.animate(0, left + dx, top + dy)
      !!this.moveApi && this.moveApi.onMove(dx, dy)
    }
  }

  onPanResponderRelease = (e, gesture) => {
    const { left, top } = this.props

    console.log("releasing on moved");
    if (!this.hasMoved) {
      // this.props.onClick()
    } else {

      // We must animate the lifted tile to its new position because it will be ignoring new props while lifted.
      // BUG!!! _ During the new layout animation, You can move the tile into the wrong position. It might have to do with using dx-dy.
      this.props.animate(800, left, top)

      // OnRelease will affirm the current arrangement of the list & the position will propogate to this component.
      !!this.moveApi && this.moveApi.onRelease()
    }

    this.isLifted = false
    this.hasMoved = false
  }

  componentDidMount() {
    const { top, left } = this.props

    this.props.animate(1000, left, top)
  }

  componentWillReceiveProps({ left, top }) {

    // Move this tile to its new position, but not if it is being moved by the user's gestures.
    if ((left !== this.props.left || top !== this.props.top) && !this.isLifted) {
      this.props.animate(800, left, top)
    }
  }

  render() {
    return (
      <View ref={this.props.setRef} {...this.pr.panHandlers} style={{ position: "absolute", width: 50, height: 50 }}>
        { this.props.children }
      </View>
    )
  }
}
