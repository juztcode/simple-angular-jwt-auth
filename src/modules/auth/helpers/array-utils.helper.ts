export class ArrayUtilsHelper {
  public static IsInArray<T>(array: T[], check: T): boolean {
    if (!array || array.length === 0) {
      return false;
    }
    return (array.filter(element => element === check).length > 0);
  }
}
