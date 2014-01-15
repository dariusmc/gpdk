class @Bullet extends Circle
  constructor: (@config = {}) ->
    super
    @is_bullet = true
    @power = @config.power || 1
    
  destroy_check: (n) -> # bullet handles score value updates 
    if n.is_root # don't allow default reaction to occur (let root handle it)
      return true 
    if n.is_bullet # i.e. bullet firing rate is too high relative to bullet size and velocity
      n.destroy() unless @is_destroyed # remove extra bullets
      return true
    @destroy() # remove the bullet that hit the drone 
    n.deplete(@power) # deplete the drone
    if n.depleted() # destroy the drone if depleted
      Gamescore.increment_value()  # increment score for hitting the drone
      Gameprez?.score(Gamescore.value) # send score update to Gameprez if available
      n.destroy()
    true