from collections.abc import Callable

from sqlmodel import Session


class UnitOfWork:
    # Unico lugar que confirma o descarta la transaccion de un caso de uso

    def __init__(self, session_factory: Callable[[], Session]) -> None:
        self.session_factory = session_factory

    def __enter__(self) -> "UnitOfWork":
        self.session = self.session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            # Se cierra aunque falle el commit; la excepcion sigue hasta el router
            self.session.close()
