import React from "react"
import Telestack from "./Telestack"
import AnimatingMoveableTile from "../MoveableTile"
import { PanResponder, View, PanResponderInstance } from "react-native"
import { GestureApi } from "../MoveableTile/MoveableTile"
interface CreateGestureApi {
  (): GestureApi
}
interface Props {
  children(spriteId: string, tileLeft: number, tileTop: number, createGestureApi: CreateGestureApi, clickResponder: PanResponderInstance): any
  editList(animationId: string): void
  isEditable: boolean
  spriteWidth: number
  spriteHeight: number
  updateAnimationList(newList: any[]): void
  list: any[]
  cols: number
  rows: number
}
interface MoveApi {
  onMove(targetIndex: number): void
  onRelease(): void
}
export default class TelestackUnnormalized extends React.Component<Props> {

  render() {
    const { isEditable, list, cols, rows, spriteWidth, spriteHeight, updateAnimationList } = this.props
    const animationId = "", animationLeft = 0, animationTop = 0; // TODO: Remove these variables


    return <Telestack
      key={animationId}
      isEditable={isEditable}
      list={list}
      syncList={updateAnimationList}>{(sprite, index, onStartMove) => {

        // Index is used to find left & top.
        // The multiple values for left and top are confusing, but I could clean it up.
        // Because the gesture API uses dx-dy which are relative to the moved tile we will use the relative left-top values.
        const tileLeft          = index % cols * spriteWidth + animationLeft
        const tileTop           = Math.trunc(index / cols) * spriteHeight + animationTop

        const relativeTileLeft  = index % cols * spriteWidth
        const relativeTileTop   = Math.trunc(index / cols) * spriteHeight

        // Significant responsibility of the Gallery is to turn the dx-dy of the MoveableTile gesture into indexes used by the ExplodingList.
        const createGestureApi = (): GestureApi => {
          const innerOnStartMove: MoveApi = onStartMove()

          // Anonymous GestureApi object transforms the dx-dy inputs to the indexes expected by the MoveApi.
          return {
            onMove: (dx: number, dy: number) => {
              const col = Math.trunc((relativeTileLeft + dx) / spriteWidth)
              const row = Math.trunc((relativeTileTop  + dy) / spriteHeight)

              if (col < cols && row < rows && col >= 0 && row >= 0) {
                const targetIndex = (row * cols) + col
                innerOnStartMove.onMove(targetIndex)
              }
            },

            onRelease: () => {
              innerOnStartMove.onRelease()
            }
          }
        }

        const clickResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => {
            return true
          }, onPanResponderRelease: () => {
            // If the thing is exploded, a click should have a different function.
            // It should either open the item for editing or something else.
            if (isEditable) {
              // This would open an image for editing
              // Editing means setting

              // TODO: CHANGE TO SPRITE FROM SPRITE ID.
              // this.props.selectSprite(sprite)
            } else {
              // console.log("Here?")
              // How do we collapse a list?
              // I think I could create a floating button
              this.props.editList(animationId)
            }
          }
        })

        return this.props.children(sprite.id, tileLeft, tileTop, createGestureApi, clickResponder)
    }}</Telestack>
  }
}
