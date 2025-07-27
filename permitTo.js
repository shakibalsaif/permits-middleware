const AppError = require("./appError");
const messages = require("./messages");

/**
 * Permit string format examples:
 *   - "admin": allow any 'admin'
 *   - "user(basic)": allow only 'basic' members with role 'user'
 *   - "!user(basic)": deny 'basic' users
 *   - "distributors(!basic)": allow distributors except 'basic' members
 */
exports.permitTo =
  (...permitUsers) =>
  (req, res, next) => {
    if (!permitUsers.at(0)) return next();

    const str = permitUsers.join().toLowerCase().replace(/ /g, "");

    const value = {
      role: req.user.role,
      memb: req.user.membership,
    };

    const exist = "[a-z]{1,}";
    const any = `!?${exist}`;

    const match = {
      role: (role = any) =>
        new RegExp(`(^|,)${role}(\\(${any}\\))?(,|$)`).test(str),
      memb: (memb = any, role = any) =>
        new RegExp(`(^|,)(${role})\\(${memb}\\)(,|$)`).test(str),
    };

    const throwError = () => {
      throw new AppError(messages.userRestricted, 403);
    };

    const logic = (name, ...options) => {
      const matchStr = value[name];
      if (!matchStr) return true;

      const matchLogic = match[name];
      if (!matchLogic)
        throw new Error(
          `match.${name} was not found, from "permitTo" middleware`
        );

      if (matchLogic(exist, ...options)) {
        if (matchLogic(`${matchStr}`, ...options)) {
          return logic(...options, `${matchStr}`);
        }
        return !logic(...options, exist);
      }

      if (matchLogic(`!${exist}`, ...options)) {
        if (matchLogic(`!${matchStr}`, ...options)) {
          return !logic(...options, `!${matchStr}`);
        }
        return logic(...options, `!${exist}`);
      }

      if (matchLogic(`!`, ...options)) return !logic(...options, `!`);
      return logic(...options);
    };

    logic("role", "memb") || throwError();
    next();
  };

this.permitTo()();

/*

{
  (exist,any?): {
    (user,any?): {
      (!?user,exist): {
        (!?user,memb): ...s 
        ...!s
      }
      (!?user,!exist): {
        (!?user,!memb): ...!s
        ...s
      }
      (!?user,!): ...!s 
      ...s
    }
    ... !x
  }
  (!exist,?any): {
    (!user): ...!x 
    ... x
  }
  (!,any?): ...!x 
  ...s
}

*/

/* 
                 MATCH__    UNMATCHED   
has !?[a-zA-Z]{1,}         
  (basic)          true       false
  (!basic)         false      true   
has !
  (!)              false                                  
  ()               default=true

has !?[a-sA-Z]{1,}
  user             true       false
  !user            false      true
has !
  !                false
  _                default=true

user,basic

user(!basic)   => 1 : 0 =>  s => 0
!user(basic)   => 0 : 1 => !s => 0
!user(!basic)  => 0 : 0 => !s => 1


(any,any?): {
  (user,any?): {
    (any?,any): {
      (!?user,memb): {
        ...s
      }
      (!?user,!memb): {
        ...!s
      }
    }
    (any?,!): {
      ...!s
    }
    ...s
  }
  (!user): {
    ...!x
  }
  (!): {
    ...!x
  }
  ...s
}

has user
  user => matched
    has memb
      !?user + memb => matched
        ... s
      !?user + !memb => matched
        ... s
    !_forbidden
      ... !s
    ... _default
  !user => matched
    ...
!_forbidden
  ... !s
... _default
*/

console.log("hi");
